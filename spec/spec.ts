import { expect } from 'chai';
import { readFileSync } from 'fs';

import { parseString } from '../grammar'

describe.skip('elevator', function() {
  it('should parse properly', function() {
    let json = readFileSync(__dirname + '/../examples/elevator.json', 'utf8');
    json = JSON.stringify(JSON.parse(json), null, 2)

    const story = readFileSync(__dirname + '/../examples/elevator.story', 'utf8');
    const parsed = parseString(story);
    const parsedJSON = JSON.stringify(parsed, null, 2)

    expect(parsedJSON).to.equal(json);
  })
})