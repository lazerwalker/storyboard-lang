import { expect } from 'chai'

import { parseString } from '../grammar'

function parsePredicate(predicate: string): string {
  const node = `# testNode\n${predicate}`
  const parsed = parseString(node)
  return parsed.graph.nodes.testNode.predicate
}

describe("predicates", function() {
  context("PredicateExp_BooleanExp", () => {
    it("BooleanExp_truthy", () => {
      const exp = ("[ foo ]")
      const parsed = parsePredicate(exp)
      expect(parsed).to.eql({
        foo: { eq: true }
      })
    })

    context("BooleanExp_comparison", () => {
      it("should parse equals", () => {
        const exp = "[ foo == 5 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { eq: "5" }
        })
      })

      it("should parse not-equals", () => {
        // TODO: Does the engine have "neq", or should this be a negation of eq?
        const exp = "[ foo != 5 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { neq: "5" }
        })
      })

      it("should parse 'isnt' as not-equals", () => {
        const exp = "[ foo isnt 5 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { neq: "5" }
        })
      })

      it("should parse single-equals", () => {
        const exp = "[ foo = 5 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { eq: "5" }
        })
      })

      it("should parse 'is' as equals", () => {
        const exp = "[ foo is 5 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { eq: "5" }
        })
      })

      it("should parse less than or equal", () => {
        const exp = "[ foo <= 5 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { lte: "5" }
        })
      })

      it("should parse greater than or equal", () => {
        const exp = "[ foo >= bar ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { gte: "bar" }
        })
      })

      it("should parse less than", () => {
        const exp = "[ foo < 5 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { lt: "5" }
        })
      })

      it("should parse greater than", () => {
        const exp = "[ foo > 10 ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { gt: "10" }
        })
      })
    })

    context("BooleanExp_exists", () => {
      it("exists", () => {
        const exp = "[ foo exists ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { exists: true }
        })
      })

      it("doesn't exist", () => {
        const exp = "[ foo doesnt exist ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { exists: false }
        })
      })
    })

  })

  context("PredicateExp_Parens", () => {
    it("should parse as normal", () => {
      const exp = "[ (foo == bar) ]"
      const parsed = parsePredicate(exp)
      expect(parsed).to.eql({
        foo: { eq: "bar" }
      })
    })
  })

  context("PredicateExp_explicit", () => {
    context("when the ifOperator is 'if'", () => {
      it("should parse as normal", () => {
        const exp = "[ if foo == bar.baz ]"
        const parsed = parsePredicate(exp)
        expect(parsed).to.eql({
          foo: { eq: "bar.baz" }
        })
      })
    })

    context("when the ifOperator negates the expression", () => {
      context("unless", () => {
        it("should return a negated predicate object", () => {
          const exp = "[ unless foo == bar ]"
          const parsed = parsePredicate(exp)
          expect(parsed).to.eql({
            not: {
              foo: { eq: "bar" }
            }
          })
        })
      })

      context("not", () => {
        it("should return a negated predicate object", () => {
          const exp = "[ not foo ]"
          const parsed = parsePredicate(exp)
          expect(parsed).to.eql({
            not: {
              foo: { eq: true }
            }
          })
        })
      })

      context("if not", () => {
        it("should return a negated predicate object", () => {
          const exp = "[ if not foo ]"
          const parsed = parsePredicate(exp)
          expect(parsed).to.eql({
            not: {
              foo: { eq: true }
            }
          })
        })
      })
    })
  })

  context("PredicateExp_chain", () => {
    it("should parse when logic operator is 'and'", () => {
      const exp = "[ foo and bar exists ]"
      const parsed = parsePredicate(exp)
      expect(parsed).to.eql({
        and: [
          {foo: { eq: true }},
          {bar: { exists: true}}
        ]
      })
    })

    it("should parse when logic operator is '&&'", () => {
      const exp = "[ foo && bar exists ]"
      const parsed = parsePredicate(exp)
      expect(parsed).to.eql({
        and: [
          {foo: { eq: true }},
          {bar: { exists: true}}
        ]
      })
    })

    it("should parse when logic operator is 'or'", () => {
      const exp = "[ if foo or bar < 10 ]"
      const parsed = parsePredicate(exp)
      expect(parsed).to.eql({
        or: [
          {foo: { eq: true }},
          {bar: { lt: "10"}}
        ]
      })

      it("should parse when logic operator is '||'", () => {
        const exp = "[ foo || bar exists ]"
        const parsed = parsePredicate(exp)
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