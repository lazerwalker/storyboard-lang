import { expect } from 'chai'

import { parseString } from '../lib'

describe("story", () => {
  describe("top-level comments", () => {
    it("should strip them out", () => {
      const withComments = `
        -- First comment
        start: node
        -- This is a comment
        # node
        text: hi mom!

        -- Another comment
      `

      const withoutComments = `
        start: node
        # node
        text: hi mom!
      `

      const parsedComments = parseString(withComments)
      const parsedWithoutComments = parseString(withoutComments)

      expect(parsedComments).to.eql(parsedWithoutComments)
    })
  })
})