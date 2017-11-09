import { expect } from 'chai';

import { parseString } from '../lib'


function loadJSON(example: string): object {
  return require(`${__dirname}/../examples/${example}.json`);
}

function loadAndParseStory(example: string): any {
  const story = require(`${__dirname}/../examples/${example}.story`);
  return parseString(story);
}

describe('full example scripts', function() {
  it("should parse elevator", () => {
    const json = loadJSON("elevator")
    const parsed = loadAndParseStory("elevator")

    expect(parsed).to.eql(json);
  })

  it("should parse switchboard", () => {
    const json = loadJSON("switchboard")
    const parsed = loadAndParseStory("switchboard")

    expect(parsed).to.eql(json);
  })
})