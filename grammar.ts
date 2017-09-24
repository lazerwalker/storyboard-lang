import * as fs from 'fs';
import * as ohm from 'ohm-js';
import * as _ from 'lodash';

const grammarText = fs.readFileSync('grammar.ohm', 'utf8')
const grammar = ohm.grammar(grammarText)

function coerceValue(value: string): any {
    if (value === "true") { return true }
    if (value === "false") { return false }
    return value
}

var currentId = 0;

const asRuntimeJSON: {[name: string]: (...nodes: ohm.Node[]) => any} = {
    Story: (start, nodes) => {
        // TODO: Would be nice if we could remove 'isBag',
        // whether removing it from use entirely or just stripping it from output
        let result = _(nodes.children).chain()
            .map((n) => n.asRuntimeJSON)
            .groupBy((n) => n.isBag ? "bag" : "graph")
            .mapValues((val: any[]) => _.keyBy(val, 'nodeId'))
            .value()

        if (result.graph) {
            result.graph = {
                nodes: result.graph
            }

            if (start.numChildren === 1) {
                result.graph.start = start.asRuntimeJSON[0]
            }

            _.forEach(result.graph.nodes, (n: any) => delete n.isBag)
        }

        if (result.bag) {
            _.forEach(result.bag, (n: any) => {
                delete n.isBag
            })
        }

        return result
    },

    Start: (_, nodeId) => nodeId.sourceString,

    Node_bag: (title, predicate, passages, choices, specialInstructions) => {
        let result: any = {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map( (p) => p.asRuntimeJSON ),
            choices: choices.children.map( (c) => c.asRuntimeJSON ),
            isBag: true
        };

        if (predicate.children.length > 0) {
            result.predicate = predicate.children[0].asRuntimeJSON;
        }

        const instructions = specialInstructions.children.map((n: ohm.Node) => n.sourceString)
        if (_.includes(instructions, "deadEnd")) {
            delete result.choices
        }
        if (_.includes(instructions, "allowRepeats")) {
            result.allowRepeats = true
        }

        return result;
    },

    Node_graph: (title, passages, choices, specialInstructions) => {
        let result: any = {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map( (p) => p.asRuntimeJSON ),
            choices: choices.children.map( (c) => c.asRuntimeJSON ),
            isBag: false
        };

        const instructions = specialInstructions.children.map((n: ohm.Node) => n.sourceString)
        if (_.includes(instructions, "deadEnd")) {
            delete result.choices
        }
        if (_.includes(instructions, "allowRepeats")) {
            result.allowRepeats = true
        }

        return result;
    },

    Predicate: (lsquarebracket, expression, rsquarebracket) => {
        return expression.asRuntimeJSON
    },

    PredicateExp_chain: (exp1, logicOperator, exp2) => {
        let operator = logicOperator.sourceString
        if (operator === "&&") operator = "and"
        if (operator === "||") operator = "or"

        let result: any = {} // TODO: Type definitions
        result[operator] = [ exp1.asRuntimeJSON, exp2.asRuntimeJSON ]
        return result
    },

    PredicateExp_explicit: (ifOperator, predicateExp) => {
        if (ifOperator.sourceString === "if") {
            return predicateExp.asRuntimeJSON
        } else {
            return {not: predicateExp.asRuntimeJSON}
        }
    },

    PredicateExp_parens: (lparen, exp, rparen) => {
        return exp.asRuntimeJSON
    },

    PredicateExp_implicit: (exp) => {
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
        const first = coerceValue(firstObj.sourceString)
        const comparator = comparatorObj.sourceString
        const second = coerceValue(secondObj.sourceString)

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

    Passage_predicate: (predicate, content) => {
        let result = content.asRuntimeJSON
        result.passageId = currentId.toString()
        result.predicate = predicate.asRuntimeJSON

        currentId += 1

        return result
    },

    Passage_noPredicate: (content) => {
        let result = content.asRuntimeJSON
        result.passageId = currentId.toString()

        currentId += 1

        return result
    },

    Choice_inlineBagNode: (choice, content) => {
        // TODO: This needs to be thought about.
        // Does the runtime schema get modified to allow nested nodes, or do these get transformed into normal bag nodes at compile time?
        let result = choice.asRuntimeJSON
        result.content = content.asRuntimeJSON
        return result
    },

    Choice_named: (operator, ident, _, predicate) => {
        return {
            nodeId: ident.sourceString,
            predicate: predicate.asRuntimeJSON
        }
    },

    Choice_unnamed: (operator, predicate) => {
        // TODO: How do we fetch the "next" nodeId?
        // Maybe the runtime engine simply goes to the next one if there's no nodeId present?
        return {
            predicate: predicate.asRuntimeJSON
        }
    },

    content: (ident, _, content) => {
        return {
            type: ident.sourceString,
            content: content.asRuntimeJSON
        }
    },

    sentence_noQuote: (content) => content.sourceString,
    sentence_quote: (lquote, content, rquote) => {
        let result = content.sourceString
        result = result.replace("\n", "")
        result = result.replace(/\s+/g, " ")
        return result
    },

    Comment: (_1, _2) => undefined,

    BagTitle_noEnd: (_, title) => title.sourceString,
    BagTitle_end: (_1, title, _2) => title.sourceString,

    GraphTitle_noEnd: (_, title) => title.sourceString,
    GraphTitle_end: (_1, title, _2) => title.sourceString,
}

export function parseString(text: string) {
    currentId = 0;

    const semantics = grammar.createSemantics()
    const match = grammar.match(text)
    const result = semantics(match)

    semantics.addAttribute('asRuntimeJSON', asRuntimeJSON)
    return result.asRuntimeJSON;
}