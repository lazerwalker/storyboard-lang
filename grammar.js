const fs = require('fs')
const ohm = require('ohm-js')
const grammarText = fs.readFileSync('grammar.ohm')
const grammar = ohm.grammar(grammarText)

const elevatorText = fs.readFileSync('switchboard.story')

const semantics = grammar.createSemantics()
const match = grammar.match(elevatorText)
const result = semantics(match)

semantics.addAttribute('asRuntimeJSON', {
    Story: (graph) => {
        return graph.asRuntimeJSON
    },

    Graph: (nodes) => {
        return nodes.children
            .map((n) => n.asRuntimeJSON)
    },

    Node_bag: (title, predicate, passages, choices) => {
        return {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map( (p) => p.asRuntimeJSON ),
            predicate: predicate.asRuntimeJSON,
            choices: choices.children.map( (c) => c.asRuntimeJSON )
        }
    },

    Node_graph: (title, passages, choices) => {
        // TODO: generate node ID, or can we just use titles?
        return {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map( (p) => p.asRuntimeJSON ),
            choices: choices.children.map( (c) => c.asRuntimeJSON )
        }
    },

    Predicate: (lparen, expressions, rparen) => {
        // TODO: I don't believe the current JSON structure is expressive enough to handle "or", which the syntax does
        return 
    },

    PredicateExp_chain: (exp1, logicOperator, exp2) => {
        
    },

    PredicateExp_explicit: (ifOperator, boolean) => {
        
    },

    // TODO: This shouldn't exist.
    PredicateExp_parens: (lparen, exp, rparen) => {
        return exp.asRuntimeJSON
    },

    PredicateExp_implicit: (exp) => {
        return exp.asRuntimeJSON
    },

    BooleanExp_exists: (identifier, operator) => {
       let result = {}
       // operator can be either "exists" or "doesnt exist"
       result[identifier] = { "exists": (operator === "exists") }
       return result
    },

    BooleanExp_comparison: (first, comparator, second) => {
        // TODO: This if block is a smell I'm doing something wrong.
        let result = {};
        if (comparator === "=" || comparator === "==" || comparator === "is") {
            result[first] = { "eq": second.sourceString }
        } else if (comparator === "!=" || comparator === "isnt") {
            // TODO
            result[first] = { "neq": second.sourceString }
        } else if (comparator === "<=") {
            result[first] = { "lte": second.sourceString };
        } else if (comparator === ">=") {
            result[first] = { "gte": second.sourceString };
        } else if (comparator === "<") {
            //TODO
            result[first] = { "lt": second.sourceString };
        } else if (comparator === ">") {
            // TODO
            result[first] = { "gt": second.sourceString };
        } else {
            throw new Error("Found unexpected comparator")
        }
        return result
    },

    BooleanExp_truthy: (ident) => {
        let result = {}
        result[ident] = { "eq": true }
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
    sentence_quote: (lquote, content, rquote) =>  content.sourceString,

    Comment: (_1, _2) => undefined,

    Title_noEnd: (_, title) => title.sourceString,            
    Title_noEndBag: (_, title) => title.sourceString,
    Title_end: (_1, title, _2) => title.sourceString,
    Title_endBag: (_1, title, _2) => title.sourceString
})

// const _ = result.asRuntimeJSON
console.log(JSON.stringify(result.asRuntimeJSON, undefined, 2))