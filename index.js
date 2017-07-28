const Grammar = require('./grammar')
const fs = require('fs')

const text = fs.readFileSync('elevator.story', 'utf8')
const json = Grammar.parseString(text)
console.log(JSON.stringify(json, undefined, 2));