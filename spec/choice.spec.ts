import { expect } from 'chai'

import { parseString } from '../lib'

describe("choices", () => {
  context("Choice_noPredicate", () => {
    it("should jump straight there", () => {
      const story = `
        # node
        text: Let's go!
        -> destination
      `
      const parsed = parseString(story)!.graph!.nodes.node.choices
      expect(parsed).to.eql([
        {
          nodeId: "destination"
        }
      ])
    })
  })
  context("Choice_predicate", () => {
    it("should create the proper choices", () => {
      const story = `
        # node

        text: Let's go!

        -> destination: [ weAreReady && timeBeforeLeaving is 0 ]
        -> prematureDestination: [ timeBeforeLeaving is 0 ]
      `
      const parsed = parseString(story)!.graph!.nodes.node.choices
      expect(parsed).to.eql([
        {
          nodeId: "destination",
          predicate: { and: [
            { weAreReady: { eq: true } },
            { timeBeforeLeaving: { eq: 0 } }
          ]}
        },
        {
          nodeId: "prematureDestination",
          predicate: { timeBeforeLeaving: { eq: 0 } }
        },
      ])
    })
  })
});