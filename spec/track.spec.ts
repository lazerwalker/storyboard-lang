import { expect } from 'chai'

import { parseString } from '../lib'

describe("track", () => {
  context("inside a bag node", () => {
    it("should allow tracks", () => {
      const input = `
        ## testNode
        [foo]
        track: bar
        output: baz
      `

      expect(parseString(input)!.bag).to.eql({
        testNode: {
          nodeId: "testNode",
          track: "bar",
          choices: [],
          predicate: { foo: { eq: true }},
          passages: [{
            passageId: "0",
            type: "output",
            content: "baz"
          }]
        }
      })
    })
  })
})