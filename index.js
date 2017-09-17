const Grammar = require('./grammar')
const fs = require('fs')

const text = fs.readFileSync('test.story', 'utf8')
const json = Grammar.parseString(text)
console.log(JSON.stringify(json, undefined, 2));