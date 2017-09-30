import { expect } from 'chai'

import { parseString } from '../grammar'

describe("nodes", () => {
  describe("order of content", () => {
    context("graph nodes", () => {
      it("should ignore order of passages and special instructions", () => {
        const first = `
          # node
          text: Hello!
          -> choice
          allowRepeats
        `

        const second = `
          # node
          allowRepeats
          text: Hello!
          -> choice
        `

        const parsedFirst = parseString(first)
        const parsedSecond = parseString(second)
        expect(parsedFirst).to.eql(parsedSecond)
      })
    })

    context("bag nodes", () => {
      it("should ignore order of passages and special instructions", () => {
        const first = `
          ## node
          [foo]
          track: backgroundTrack
          text: Hello!
          -> choice
          allowRepeats
        `

        const second = `
          ## node
          [foo]
          allowRepeats
          text: Hello!
          -> choice
          track: backgroundTrack
        `

        const parsedFirst = parseString(first)
        const parsedSecond = parseString(second)
        expect(parsedFirst).to.eql(parsedSecond)
      })

    })
  })
})