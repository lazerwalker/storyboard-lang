const expect = require('chai').expect;
const fs = require('fs');

const Grammar = require('../grammar')

describe('elevator', function() {
  it('should parse properly', function() {
    let json = fs.readFileSync(__dirname + '/../elevator.json', 'utf8');
    json = JSON.stringify(JSON.parse(json), null, 2)

    const story = fs.readFileSync(__dirname + '/../elevator.story', 'utf8');
    const parsed = Grammar.parseString(story);
    const parsedJSON = JSON.stringify(parsed, null, 2)

    expect(parsedJSON).to.equal(json);
  })
})