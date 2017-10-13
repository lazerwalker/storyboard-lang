import * as fs from 'fs';
import * as ohm from 'ohm-js';
import * as _ from 'lodash';
import * as Types from './types';

const grammarText = fs.readFileSync(`${__dirname}/../grammar.ohm`, 'utf8')
const grammar = ohm.grammar(grammarText)

/**
 * In a few situations, if an author writes e.g. 5 or true, we want to coerce
 * those to number/boolean instead of string.
 *
 * (We need the full Node because we use both the raw sourceString for an ident
 * and the "parsed" version that has the leading/trailing quotes stripped)
 */
function coerceValue(node: ohm.Node): string|number|boolean {
  if (node.ctorName != "ident") {
    throw "Called `coerceValue` on something that wasn't a raw identifier"
  }

  const value = node.asRuntimeJSON
  const str = node.sourceString

  // If the author explicitly wrapped the value in double-quotes, leave it be
  if (str[0] == '"' && str[str.length-1] == '"') {
    return value
  }

  if (value === "true") { return true }
  if (value === "false") { return false }

  if (parseInt(value).toString() === value) { return parseInt(value) }

  return value
}

var currentPassageId = 0;
var currentInlineBagNodeId = 0;

const asRuntimeJSON: {[name: string]: (...nodes: ohm.Node[]) => Types.StoryboardType|string|void} = {
  Story: (openingComment, start, content): Types.Story => {
    const grouped = _.groupBy(content.children, "ctorName")
    const bagNodes = grouped["BagNode"]
    const graphNodes = grouped["GraphNode"]

    let result: any = {}

    if (bagNodes) {
      result.bag = _.chain(bagNodes)
        .map((n) => n.asRuntimeJSON)
        .keyBy('nodeId')
        .value()
    }

    if (graphNodes) {
      let graph = _.chain(graphNodes)
        .map((n) => n.asRuntimeJSON)
        .keyBy('nodeId')
        .value()

      result.graph = {
        nodes: graph
      }

      if (start.numChildren === 1) {
        result.graph.start = start.asRuntimeJSON[0]
      }

      _.forEach(result.graph.nodes, (n: any) => {
        if (n.choices) {
          let actualChoices = n.choices.filter((o: any) => _.isUndefined(o.passages))
          let inlineBagNodes = _.difference(n.choices, actualChoices)
          n.choices = actualChoices

          inlineBagNodes.forEach((bagNode: any) => {
            bagNode.predicate = { and: [
              {"graph.currentNodeId": { eq: n.nodeId }},
              bagNode.predicate
            ]}

            if (!result.bag) { result.bag = {} }
            result.bag[bagNode.nodeId] = bagNode
          })
        }
      })
    }

    return result
  },

  Start: (_, nodeId) => nodeId.sourceString,

  BagNode: (title, predicate, children): Types.Node => {
    const grouped = _.groupBy(children.children, "ctorName")
    const passages = grouped["Passage"] || []
    const choices = grouped["Choice"] || []
    const specialInstructions = grouped["specialInstruction"] || []
    const track = grouped["track"] || []

    let result: any = {
      nodeId: title.asRuntimeJSON,
      passages: passages.map( (p) => p.asRuntimeJSON ),
      choices: choices.map( (c) => c.asRuntimeJSON )
    };

    if (predicate.children.length > 0) {
      result.predicate = predicate.children[0].asRuntimeJSON;
    }

    if (track.length === 1) {
      result.track = track[0].asRuntimeJSON
    } else {
      // TODO: Throw an error if track.length > 1
    }

    const instructions = specialInstructions.map((n: ohm.Node) => n.sourceString)
    if (_.includes(instructions, "deadEnd")) {
      delete result.choices
    }
    if (_.includes(instructions, "allowRepeats")) {
      result.allowRepeats = true
    }

    return result;
  },

  GraphNode: (title, children): Types.Node => {
    const grouped = _.groupBy(children.children, "ctorName")
    const passages = grouped["Passage"] || []
    const choices = grouped["Choice"] || []
    const specialInstructions = grouped["specialInstruction"] || []

    let result: any = {
      nodeId: title.asRuntimeJSON,
      passages: passages.map( (p) => p.asRuntimeJSON ),
      choices: choices.map( (n) => n.asRuntimeJSON ),
    };

    const instructions = specialInstructions.map((n: ohm.Node) => n.sourceString)
    if (_.includes(instructions, "deadEnd")) {
      delete result.choices
    }
    if (_.includes(instructions, "allowRepeats")) {
      result.allowRepeats = true
    }

    return result;
  },

  Predicate: (lsquarebracket, expression, rsquarebracket): Types.Predicate => {
    return expression.asRuntimeJSON
  },

  PredicateExp_chain: (exp1, logicOperator, exp2): Types.Predicate => {
    let operator = logicOperator.sourceString
    if (operator === "&&") operator = "and"
    if (operator === "||") operator = "or"

    let result: Types.Predicate = {} // TODO: Type definitions
    result[operator] = [ exp1.asRuntimeJSON, exp2.asRuntimeJSON ]
    return result
  },

  PredicateExp_explicit: (ifOperator, predicateExp): Types.Predicate => {
    if (ifOperator.sourceString === "if") {
      return predicateExp.asRuntimeJSON
    } else {
      return {not: predicateExp.asRuntimeJSON}
    }
  },

  PredicateExp_parens: (lparen, exp, rparen): Types.Predicate => {
    return exp.asRuntimeJSON
  },

  PredicateExp_implicit: (exp): Types.Predicate => {
    return exp.asRuntimeJSON
  },

  BooleanExp_exists: (identifier, operator) => {
    let result: any = {} // TODO
    // operator can be either "exists" or "doesnt exist"
    const exists = (operator.sourceString === "exists")
    result[identifier.sourceString] = { "exists": exists }
    return result
  },

  BooleanExp_comparison: (firstObj, comparatorObj, secondObj) => {
    const first = firstObj.sourceString
    const comparator = comparatorObj.sourceString
    const second = coerceValue(secondObj)

    // TODO: This if block is a smell I'm doing something wrong.
    let result: any = {};
    if (comparator === "=" || comparator === "==" || comparator === "is") {
      result[first] = { "eq": second }
    } else if (comparator === "!=" || comparator === "isnt") {
      result[first] = { "neq": second }
    } else if (comparator === "<=") {
      result[first] = { "lte": second };
    } else if (comparator === ">=") {
      result[first] = { "gte": second };
    } else if (comparator === "<") {
      result[first] = { "lt": second };
    } else if (comparator === ">") {
      result[first] = { "gt": second };
    } else {
      throw new Error("Found unexpected comparator")
    }
    return result
  },

  BooleanExp_truthy: (ident) => {
    let result: any = {}
    result[ident.sourceString] = { "eq": true }
    return result
  },

  Passage_predicate: (predicate, content): Types.Passage => {
    let result = content.asRuntimeJSON
    result.passageId = currentPassageId.toString()
    result.predicate = predicate.asRuntimeJSON

    currentPassageId += 1

    return result
  },

  Passage_noPredicate: (content): Types.Passage => {
    let result = content.asRuntimeJSON
    result.passageId = currentPassageId.toString()

    currentPassageId += 1

    return result
  },

  Passage_variable: (variableAssignment): Types.Passage => {
    let result = variableAssignment.asRuntimeJSON
    result.passageId = currentPassageId.toString()

    currentPassageId += 1

    return result
  },

  Passage_variableWithPredicate: (predicate, variableAssignment): Types.Passage => {
    let result = variableAssignment.asRuntimeJSON
    result.passageId = currentPassageId.toString()
    result.predicate = predicate.asRuntimeJSON

    currentPassageId += 1

    return result
  },

  VariableAssignment: (_1, key, _2, value): any => {
    return {
      set: {
        [key.sourceString]: coerceValue(value)
      }
    }
  },

  Choice_inlineBagNode: (_1, predicate, content): Types.Choice => {
    const grouped = _.groupBy(content.children, "ctorName")
    const track = grouped["track"] || []
    const passages = grouped["Passage"] || []
    const specialInstructions = grouped["specialInstruction"] || []

    const parsedPassages = passages.map((n: ohm.Node) => n.asRuntimeJSON)

    const title = `inlineBag_${currentInlineBagNodeId}`
    currentInlineBagNodeId += 1

    let result: any = {
      nodeId: title,
      predicate: predicate.asRuntimeJSON,
      passages: parsedPassages
    }

    const instructions = specialInstructions.map((n: ohm.Node) => n.sourceString)
    if (_.includes(instructions, "deadEnd")) {
      delete result.choices
    }
    if (_.includes(instructions, "allowRepeats")) {
      result.allowRepeats = true
    }

    if (track.length === 1) {
      result.track = track[0].asRuntimeJSON
    } else {
      // TODO: Throw an error if track.length > 1
    }

    return result;
  },

  Choice_predicate: (operator, ident, _, predicate): Types.Choice => {
    return {
      nodeId: ident.sourceString,
      predicate: predicate.asRuntimeJSON
    }
  },

  Choice_noPredicate: (operator, ident): Types.Choice => {
    return {
      nodeId: ident.sourceString
    }
  },

  track: (_, track): string => track.sourceString,

  content: (ident, _, content) => {
    return {
      type: ident.sourceString,
      content: content.asRuntimeJSON
    }
  },

  ident_unquoted: (ident): string => ident.sourceString,
  ident_quoted: (lquote, ident, rquote): string => ident.sourceString,

  sentence_unquoted: (content): string => content.sourceString,
  sentence_quoted: (lquote, content, rquote): string => {
    let result = content.sourceString
    result = result.replace("\n", "")
    result = result.replace(/\s+/g, " ")
    return result
  },

  Comment: (_1, _2) => undefined,

  BagTitle_noEnd: (_, title): string => title.sourceString,
  BagTitle_end: (_1, title, _2): string => title.sourceString,

  GraphTitle_noEnd: (_, title): string => title.sourceString,
  GraphTitle_end: (_1, title, _2): string => title.sourceString,
}

export function parseString(text: string): Types.Story|undefined {
  currentPassageId = 0;
  currentInlineBagNodeId = 0;

  const semantics = grammar.createSemantics()
  const match = grammar.match(text)

  if (match.failed()) {
    console.log(match.message)
    return
  }

  const result = semantics(match)

  semantics.addAttribute('asRuntimeJSON', asRuntimeJSON)
  return result.asRuntimeJSON;
}