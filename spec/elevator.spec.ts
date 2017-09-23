import { expect } from 'chai';
import { readFileSync } from 'fs';

import { parseString } from '../grammar'

describe('elevator', function() {
  it.only('should parse properly', function() {
    let json = readFileSync(__dirname + '/../examples/elevator.json', 'utf8');
    json = JSON.parse(json)

    const story = readFileSync(__dirname + '/../examples/elevator.story', 'utf8');
    const parsed = parseString(story);

    expect(parsed).to.eql(json);
  })
})