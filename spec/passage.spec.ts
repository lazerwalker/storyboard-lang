import { expect } from 'chai'

import { parseString } from '../lib'

describe("passages", () => {
  context("without a predicate", () => {
    context("setting values", () => {
      it("should parse properly", () => {
        const input = `
          # testNode

          set playerName = Mike
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
                    set: {
                      playerName: "Mike"
                    }
                  }
                ]
              },
            }
          }
        })
      })
      it("should coerce booleans", () => {
        const input = `
          # testNode

          set havingAGreatDay to true
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
                    set: {
                      havingAGreatDay: true
                    }
                  }
                ]
              },
            }
          }
        })
      })
    })
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