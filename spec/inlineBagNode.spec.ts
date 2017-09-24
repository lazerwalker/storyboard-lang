import { expect } from 'chai'

import { parseString } from '../grammar'

describe("inline bag nodes", () => {
  context("when the inline node has a predicate", () => {
    it("should make a bag node with a compound predicate", () => {
      const input = `
        # testNode
        <-> [ score > 5 and gameIsOver ]
          text: You did it! You have a high score of {score}!
      `

      expect(parseString(input)).to.eql({
        graph: {
          nodes: {
            testNode: {
              nodeId: "testNode",
              passages: [],
              choices: []
            }
          }
        },
        bag: {
          "inlineBag_0": {
            nodeId: "inlineBag_0",
            predicate: { "and": [
              { "graph.currentNodeId": { eq: "testNode" }},
              { and: [
                { "score": { gt: "5" } },
                { "gameIsOver": { eq: true }}
              ]}
            ]},
            passages: [
              {
                "passageId": "0",
                "type": "text",
                "content": "You did it! You have a high score of {score}!"
              }
            ]
          }
        }
      })
    })
  })
})