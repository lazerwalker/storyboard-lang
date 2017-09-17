const fs = require('fs')
const ohm = require('ohm-js')
const _ = require('underscore')

const grammarText = fs.readFileSync('grammar.ohm')
const grammar = ohm.grammar(grammarText)

const elevatorText = fs.readFileSync('elevator.story')

const asRuntimeJSON = {
    Story: (predicate) => {
        // TODO: Would be nice if we could remove 'isBag',
        // whether removing it from use entirely or just stripping it from output
        let result = _(nodes.children).chain()
            .map((n) => n.asRuntimeJSON)
            .groupBy((n) => n.isBag ? "bag" : "graph")
            .mapObject((val, key) => _.indexBy(val, 'nodeId'))
            .value()

        if (result.graph) {
            result.graph = {
                start: start.asRuntimeJSON,
                nodes: result.graph
            }
        }
        return result
    },

    Start: (_, nodeId) => nodeId.sourceString,

    Node_bag: (title, predicate, passages, choices) => {
        return {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map( (p) => p.asRuntimeJSON ),
            predicate: predicate.asRuntimeJSON,
            choices: choices.children.map( (c) => c.asRuntimeJSON ),
            isBag: true
        }
    },

    Node_graph: (title, predicate, passages, choices) => {
        // TODO: if predicate doesn't exist?
        // TODO: generate node ID, or can we just use titles?
        return {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map( (p) => p.asRuntimeJSON ),
            predicate: predicate.asRuntimeJSON,
            choices: choices.children.map( (c) => c.asRuntimeJSON ),
            isBag: false
        }
    },

    Predicate: (lsquarebracket, expression, rsquarebracket) => {
        return expression.asRuntimeJSON
    },

    PredicateExp_chain: (exp1, logicOperator, exp2) => {
        let operator = logicOperator.sourceString
        if (operator === "&&") operator = "and"
        if (operator === "||") operator = "or"

        let result = {}
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
       let result = {}
       // operator can be either "exists" or "doesnt exist"
       const exists = (operator.sourceString === "exists")
       result[identifier.sourceString] = { "exists": exists }
       return result
    },

    BooleanExp_comparison: (firstObj, comparatorObj, secondObj) => {
        const first = firstObj.sourceString
        const comparator = comparatorObj.sourceString
        const second = secondObj.sourceString

        // TODO: This if block is a smell I'm doing something wrong.
        let result = {};
        if (comparator === "=" || comparator === "==" || comparator === "is") {
            result[first] = { "eq": second }
        } else if (comparator === "!=" || comparator === "isnt") {
            // TODO
            result[first] = { "neq": second }
        } else if (comparator === "<=") {
            result[first] = { "lte": second };
        } else if (comparator === ">=") {
            result[first] = { "gte": second };
        } else if (comparator === "<") {
            //TODO
            result[first] = { "lt": second };
        } else if (comparator === ">") {
            // TODO
            result[first] = { "gt": second };
        } else {
            throw new Error("Found unexpected comparator")
        }
        return result
    },

    BooleanExp_truthy: (ident) => {
        let result = {}
        result[ident.sourceString] = { "eq": true }
        return result
    },

    // TODO: These special instructions (e.g. allows_repeat) need to be shoved on the higher-level JSON object rather than the passage array
    Passage_instruction: (instruction) => {
        let result = {}
        result[instruction.sourceString] = true
        return result
    },

    Passage_predicate: (predicate, content) => {
        // TODO: Assign passage ID
        let result = content.asRuntimeJSON
        result.passageId = "id"
        result.predicate = predicate.asRuntimeJSON
        return result
    },

    Passage_noPredicate: (content) => {
        let result = content.asRuntimeJSON
        result.passageId = "id"
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

function parseString(text) {
    const semantics = grammar.createSemantics()
    const match = grammar.match(text)
    const result = semantics(match)

    semantics.addAttribute('asRuntimeJSON', asRuntimeJSON)

    return result.asRuntimeJSON;
}

exports.parseString = parseString