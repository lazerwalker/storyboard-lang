const expect = require('chai').expect;
const fs = require('fs');

const Grammar = require('../grammar')

describe("predicates", function() {
  context("PredicateExp_BooleanExp", () => {
    it("BooleanExp_truthy", () => {
      const exp = "[ foo ]"
      const parsed = Grammar.parseString(exp)
      expect(parsed).to.eql({
        foo: { eq: true }
      })
    })

    it("BooleanExp_comparison", () => {
      const exp = "[ foo == 5 ]"
      const parsed = Grammar.parseString(exp)
      expect(parsed).to.eql({
        foo: { eq: "5" }
      })
    })

    context("BooleanExp_exists", () => {
      it("exists", () => {
        const exp = "[ foo exists ]"
        const parsed = Grammar.parseString(exp)
        expect(parsed).to.eql({
          foo: { exists: true }
        })
      })

      it("doesn't exist", () => {
        const exp = "[ foo doesnt exist ]"
        const parsed = Grammar.parseString(exp)
        expect(parsed).to.eql({
          foo: { exists: false }
        })
      })
    })

  })

  context("PredicateExp_Parens", () => {
    it("should parse as normal", () => {
      const exp = "[ (foo == bar) ]"
      const parsed = Grammar.parseString(exp)
      expect(parsed).to.eql({
        foo: { eq: "bar" }
      })
    })
  })

  context("PredicateExp_explicit", () => {
    context("when the ifOperator is 'if'", () => {
      it("should parse as normal", () => {
        const exp = "[ if foo == bar.baz ]"
        const parsed = Grammar.parseString(exp)
        expect(parsed).to.eql({
          foo: { eq: "bar.baz" }
        })
      })
    })

    context("when the ifOperator negates the expression", () => {
      it("should return a negated predicate object", () => {
        const exp = "[ unless foo == bar ]"
        const parsed = Grammar.parseString(exp)
        expect(parsed).to.eql({
          not: {
            foo: { eq: "bar" }
          }
        })
      })
    })
  })

  context("PredicateExp_chain", () => {
    it("should parse when logic operator is 'and'", () => {
      const exp = "[ foo and bar exists ]"
      const parsed = Grammar.parseString(exp)
      expect(parsed).to.eql({
        and: [
          {foo: { eq: true }},
          {bar: { exists: true}}
        ]
      })
    })

    it("should parse when logic operator is '&&'", () => {
      const exp = "[ foo && bar exists ]"
      const parsed = Grammar.parseString(exp)
      expect(parsed).to.eql({
        and: [
          {foo: { eq: true }},
          {bar: { exists: true}}
        ]
      })
    })

    it("should parse when logic operator is 'or'", () => {
      const exp = "[ if foo or bar < 10 ]"
      const parsed = Grammar.parseString(exp)
      expect(parsed).to.eql({
        or: [
          {foo: { eq: true }},
          {bar: { lt: "10"}}
        ]
      })

      it("should parse when logic operator is '||'", () => {
        const exp = "[ foo || bar exists ]"
        const parsed = Grammar.parseString(exp)
        expect(parsed).to.eql({
          or: [
            {foo: { eq: true }},
            {bar: { exists: true}}
          ]
        })
      })
    })
  })
})