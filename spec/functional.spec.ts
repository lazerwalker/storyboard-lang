import { expect } from 'chai';
import { readFileSync } from 'fs';

import { parseString } from '../grammar'

function loadJSON(example: string): string {
  let json = readFileSync(`${__dirname}/../examples/${example}.json`, 'utf8');
  return JSON.parse(json)
}

function loadAndParseStory(example: string): any {
  const story = readFileSync(`${__dirname}/../examples/${example}.story`, 'utf8');
  return parseString(story);
}

describe('full example scripts', function() {
  it("should parse elevator", () => {
    const json = loadJSON("elevator")
    const parsed = loadAndParseStory("elevator")

    expect(parsed).to.eql(json);
  })

  it.skip("should parse switchboard", () => {
    const json = loadJSON("switchboard")
    const parsed = loadAndParseStory("switchboard")

    expect(parsed).to.eql(json);
  })
})