import { expect } from 'chai'

import { parseString } from '../grammar'

describe("special instructions", () => {
  context("for a graph node", () => {
    describe("dead_end", () => {
      it("should not have a choices array", () => {
        const input = `
          # testNode
          speech: Nothing more here!
          deadEnd
        `

        expect(parseString(input)).to.eql({
          graph: {
            nodes: {
              "testNode": {
                nodeId: "testNode",
                passages: [
                  {
                    passageId: "0",
                    type: "speech",
                    content: "Nothing more here!"
                  }
                ],
              },
            }
          }
        })
      })
    })

    describe("allow_repeats", () => {
      it("should set the right property", () => {
        const input = `
          # testNode
          speech: Nothing more here!
          allowRepeats
        `

        expect(parseString(input)).to.eql({
          graph: {
            nodes: {
              "testNode": {
                nodeId: "testNode",
                choices: [],
                allowRepeats: true,
                passages: [
                  {
                    passageId: "0",
                    type: "speech",
                    content: "Nothing more here!"
                  }
                ],
              },
            }
          }
        })
      })
    })

    it("should allow multiple special instructions", () => {
      const input = `
        # testNode
        speech: Nothing more here!
        allowRepeats
        deadEnd
      `

      expect(parseString(input)).to.eql({
        graph: {
          nodes: {
            "testNode": {
              nodeId: "testNode",
              allowRepeats: true,
              passages: [
                {
                  passageId: "0",
                  type: "speech",
                  content: "Nothing more here!"
                }
              ],
            },
          }
        }
      })
    })
  })
})