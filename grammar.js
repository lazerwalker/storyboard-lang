"use strict";
exports.__esModule = true;
var fs = require("fs");
var ohm = require("ohm-js");
var _ = require('underscore');
var grammarText = fs.readFileSync('grammar.ohm');
var grammar = ohm.grammar(grammarText);
var elevatorText = fs.readFileSync('elevator.story');
var asRuntimeJSON = {
    Story: function (start, nodes) {
        // TODO: Would be nice if we could remove 'isBag',
        // whether removing it from use entirely or just stripping it from output
        var result = _(nodes.children).chain()
            .map(function (n) { return n.asRuntimeJSON; })
            .groupBy(function (n) { return n.isBag ? "bag" : "graph"; })
            .mapObject(function (val, key) { return _.indexBy(val, 'nodeId'); })
            .value();
        if (result.graph) {
            result.graph = {
                start: start.asRuntimeJSON,
                nodes: result.graph
            };
        }
        return result;
    },
    Start: function (_, nodeId) { return nodeId.sourceString; },
    Node_bag: function (title, predicate, passages, choices) {
        return {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map(function (p) { return p.asRuntimeJSON; }),
            predicate: predicate.asRuntimeJSON,
            choices: choices.children.map(function (c) { return c.asRuntimeJSON; }),
            isBag: true
        };
    },
    Node_graph: function (title, predicate, passages, choices) {
        // TODO: what if predicate doesn't exist?
        return {
            nodeId: title.asRuntimeJSON,
            passages: passages.children.map(function (p) { return p.asRuntimeJSON; }),
            predicate: predicate.asRuntimeJSON,
            choices: choices.children.map(function (c) { return c.asRuntimeJSON; }),
            isBag: false
        };
    },
    Predicate: function (lsquarebracket, expression, rsquarebracket) {
        return expression.asRuntimeJSON;
    },
    PredicateExp_chain: function (exp1, logicOperator, exp2) {
        var operator = logicOperator.sourceString;
        if (operator === "&&")
            operator = "and";
        if (operator === "||")
            operator = "or";
        var result = {};
        result[operator] = [exp1.asRuntimeJSON, exp2.asRuntimeJSON];
        return result;
    },
    PredicateExp_explicit: function (ifOperator, predicateExp) {
        if (ifOperator.sourceString === "if") {
            return predicateExp.asRuntimeJSON;
        }
        else {
            return { not: predicateExp.asRuntimeJSON };
        }
    },
    PredicateExp_parens: function (lparen, exp, rparen) {
        return exp.asRuntimeJSON;
    },
    PredicateExp_implicit: function (exp) {
        return exp.asRuntimeJSON;
    },
    BooleanExp_exists: function (identifier, operator) {
        var result = {};
        // operator can be either "exists" or "doesnt exist"
        var exists = (operator.sourceString === "exists");
        result[identifier.sourceString] = { "exists": exists };
        return result;
    },
    BooleanExp_comparison: function (firstObj, comparatorObj, secondObj) {
        var first = firstObj.sourceString;
        var comparator = comparatorObj.sourceString;
        var second = secondObj.sourceString;
        // TODO: This if block is a smell I'm doing something wrong.
        var result = {};
        if (comparator === "=" || comparator === "==" || comparator === "is") {
            result[first] = { "eq": second };
        }
        else if (comparator === "!=" || comparator === "isnt") {
            result[first] = { "neq": second };
        }
        else if (comparator === "<=") {
            result[first] = { "lte": second };
        }
        else if (comparator === ">=") {
            result[first] = { "gte": second };
        }
        else if (comparator === "<") {
            result[first] = { "lt": second };
        }
        else if (comparator === ">") {
            result[first] = { "gt": second };
        }
        else {
            throw new Error("Found unexpected comparator");
        }
        return result;
    },
    BooleanExp_truthy: function (ident) {
        var result = {};
        result[ident.sourceString] = { "eq": true };
        return result;
    },
    // TODO: These special instructions (e.g. allows_repeat) need to be shoved on the higher-level JSON object rather than the passage array
    Passage_instruction: function (instruction) {
        var result = {};
        result[instruction.sourceString] = true;
        return result;
    },
    Passage_predicate: function (predicate, content) {
        // TODO: Assign passage ID
        var result = content.asRuntimeJSON;
        result.passageId = "id";
        result.predicate = predicate.asRuntimeJSON;
        return result;
    },
    Passage_noPredicate: function (content) {
        var result = content.asRuntimeJSON;
        result.passageId = "id";
        return result;
    },
    Choice_inlineBagNode: function (choice, content) {
        // TODO: This needs to be thought about.
        // Does the runtime schema get modified to allow nested nodes, or do these get transformed into normal bag nodes at compile time?
        var result = choice.asRuntimeJSON;
        result.content = content.asRuntimeJSON;
        return result;
    },
    Choice_named: function (operator, ident, _, predicate) {
        return {
            nodeId: ident.sourceString,
            predicate: predicate.asRuntimeJSON
        };
    },
    Choice_unnamed: function (operator, predicate) {
        // TODO: How do we fetch the "next" nodeId?
        // Maybe the runtime engine simply goes to the next one if there's no nodeId present?
        return {
            predicate: predicate.asRuntimeJSON
        };
    },
    content: function (ident, _, content) {
        return {
            type: ident.sourceString,
            content: content.asRuntimeJSON
        };
    },
    sentence_noQuote: function (content) { return content.sourceString; },
    sentence_quote: function (lquote, content, rquote) {
        var result = content.sourceString;
        result = result.replace("\n", "");
        result = result.replace(/\s+/g, " ");
        return result;
    },
    Comment: function (_1, _2) { return undefined; },
    BagTitle_noEnd: function (_, title) { return title.sourceString; },
    BagTitle_end: function (_1, title, _2) { return title.sourceString; },
    GraphTitle_noEnd: function (_, title) { return title.sourceString; },
    GraphTitle_end: function (_1, title, _2) { return title.sourceString; }
};
function parseString(text) {
    var semantics = grammar.createSemantics();
    var match = grammar.match(text);
    var result = semantics(match);
    semantics.addAttribute('asRuntimeJSON', asRuntimeJSON);
    return result.asRuntimeJSON;
}
exports.parseString = parseString;
