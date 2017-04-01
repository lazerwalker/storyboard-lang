const fs = require('fs')
const ohm = require('ohm-js')
const grammarText = fs.readFileSync('grammar.ohm')
const grammar = ohm.grammar(grammarText)

const elevatorText = fs.readFileSync('switchboard.story')

console.log(grammar.match(elevatorText).succeeded())