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
            passages: passages.map( (p) => p.asRuntimeJSON ),
            predicate: predicate.asRuntimeJSON,
            choices: choices.map( (c) => c.asRuntimeJSON )
        }
    },

    Node_graph: (title, passages, choices) => {
        // TODO: generate node ID, or can we just use titles?
        return {
            nodeId: title.asRuntimeJSON,
            passages: passages.map( (p) => p.asRuntimeJSON ),
            choices: choices.map( (c) => c.asRuntimeJSON )
        }
    },

    Predicate: (lparen, expressions, rparen) => {
        return expressions.map( (e) => e.asRuntimeJSON )
    },

    PredicateExp_chain: (exp1, logicOperator, exp2) => {
        
    },

    PredicateExp_explicit: (ifOperator, boolean) => {
        
    },

    // TODO: This shouldn't exist.
    PredicateExp_parens: (lparen, exp, rparen) => {
        
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

    Passage_instruction: (comment, instruction) => {

    },

    Passage_predicate: (predicate, content) => {
        
    },

    Passage_noPredicate: (content) => {

    },

    Choice_inlineBagNode: (choice, content) => {

    },

    Choice_named: (operator, ident, _, predicate) => {

    },

    Choice_unnamed: (operator, predicate) => {

    },

    Comment: (_1, _2) =>  undefined,

    Title_noEnd: (_, title) => title.sourceString,            
    Title_noEndBag: (_, title) => title.sourceString,
    Title_end: (_1, title, _2) => title.sourceString,
    Title_endBag: (_1, title, _2) => title.sourceString,

     _nonterminal:  function(children) {
        if (children.length === 1) {
            return children[0].asRuntimeJSON;
        } else {
            throw new Error("Uh oh!" + children)
        }
    }
})

console.log(result.asRuntimeJSON)