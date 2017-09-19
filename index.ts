import { parseString } from './grammar'
import { readFileSync } from 'fs'

const text = readFileSync('spec/fixtures/predicates.story', 'utf8')
console.log(text)
const json = parseString(text)
console.log(JSON.stringify(json, undefined, 2));