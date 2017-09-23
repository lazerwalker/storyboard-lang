import { expect } from 'chai'

import { parseString } from '../grammar'

describe("passages", () => {
  context("without a predicate", () => {
    it("should properly parse", () => {
      const input = `
        # testNode

        speech: "Hi mom!"

        handGesture: wave
      `

      expect(parseString(input)).to.eql({
        graph: {
          nodes: {
            "testNode": {
              nodeId: "testNode",
              choices: [],
              passages: [
                {
                  passageId: "0",
                  type: "speech",
                  content: "Hi mom!"
                },
                {
                  passageId: "1",
                  type: "handGesture",
                  content: "wave"
                }
              ]
            },
          }
        }
      })
    })
  })
})