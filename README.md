# Storyboard-lang

[![CI Status](http://img.shields.io/travis/lazerwalker/storyboard-lang.svg?style=flat)](https://travis-ci.org/lazerwalker/storyboard-lang)


[Storyboard](https://github.com/lazerwalker/storyboard) (name liable to change) is an experimental interactive fiction engine designed to enable narrative experiences in AR and other digital/physical hybrid environments.

This is a scripting language for Storyboard. It's designed to look similar to [Ink](https://github.com/inkle/ink), although there are a lot of differences based on how different the underlying engine's narrative model is.

Storyboard-lang is written in [Ohm](https://github.com/harc/ohm). This tool converts from storyboard-lang syntax into the JSON object format that the Storyboard engine reads.

The main Storyboard engine includes this project as a dependency. Unless you're hoping to actively hack on the compiler, you probably care about the main [Storyboard](https://github.com/lazerwalker/storyboard) repo rather than this one.

## Language Reference

Erm, this is coming soon! The project is rather immature, so this may wait until the language itself is a bit less in flux.

The `examples` folder contains a few example `.story` files, as well as the corresponding JSON they are expected to compile down to. There are automated tests confirming their correctness, so even though things are fairly in-flux, the examples shouldn't be outdated as long as the test suite is passing.

## Setup

This project is not yet published on `npm`, but it will be once things stabilize a bit.

For now:

1. Clone this repo
2. Fetch dependencies: `yarn install`
3. Build the library: `npm run build`

`dist/bundle.js` will contain a library suitable for importing into your own Node project. The `dist/dist` folder will contain TypeScript definition files as well.

## Usage

This module exports a single `parseString()` function, which takes in a string of Ohm code and returns a JSON `Story` object (essentially an AST in a JSON format that the Storyboard runtime engine can understand). It also exports a bunch of TypeScript types, which are consumed by the Storyboard engine.

For those interested in the actual code: `grammar.ohm` contains the grammar, and `grammar.ts` contains the Ohm semantics that transform the AST into Storyboard-compatible JSON.

The `spec` folder also contains pretty detailed BDD-style tests, which may serve as a useful guide to intended functionality.

## License
This project is licensed under the MIT license. See the LICENSE file for more info.


## Contact
* https://github.com/lazerwalker
* https://twitter.com/lazerwalker