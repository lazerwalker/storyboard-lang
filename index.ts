import { parseString } from './grammar'
import { readFileSync } from 'fs'

const text = readFileSync('examples/test.story', 'utf8')
const json = parseString(text)
console.log(JSON.stringify(json, undefined, 2));