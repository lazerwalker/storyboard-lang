import { expect } from 'chai'

import { parseString } from '../lib'

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

  describe("comments", () => {
    context("graph nodes", () => {
      it("should ignore them", () => {
        const withComments = `
          # node
          -- I am a comment
          text: Hello!
          -- Yet another comment
          -> choice
          allowRepeats
          -- I am another comment
        `

        const withoutComments = `
          # node
          text: Hello!
          -> choice
          allowRepeats
        `

        const parsedComments = parseString(withComments)
        const parsedWithoutComments = parseString(withoutComments)

        expect(parsedComments).to.eql(parsedWithoutComments)
      })
    })

    context("bag nodes", () => {
      it("should ignore them", () => {
        const withComments = `
          ## node
          [predicate]
          -- I am a comment
          text: Hello!
          -- Yet another comment
          -> choice
          allowRepeats
          -- I am another comment
        `

        const withoutComments = `
          ## node
          [predicate]
          text: Hello!
          -> choice
          allowRepeats
        `

        const parsedComments = parseString(withComments)
        const parsedWithoutComments = parseString(withoutComments)

        expect(parsedComments).to.eql(parsedWithoutComments)
      })
    })
  })
})