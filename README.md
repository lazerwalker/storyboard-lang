# Storyboard-lang
[Storyboard](https://github.com/lazerwalker/storyboard) (name to be changed :P) is an experimental interactive fiction engine designed to enable narrative experiences in AR and other digital/physical hybrid environments.

This is an experimental stab at creating a scripting language for Storyboard. It's designed to look similar to [Ink](https://github.com/inkle/ink), although there are a lot of differences based on how different the underlying engine's narrative model is.

It's written in [Ohm](https://github.com/harc/ohm), a great tool to create programming languages and DSLs in JavaScript. This tool converts from storyboard-lang syntax into the JSON object format that the storyboard engine reads.


## Usage
This project is very much a work-in-progress and isn't really yet ready for anyone else to use.

If you're particularly eager: `index.js` usually has some form of code that loads up a `.story` file and parses it. `examples/` are full of some examples that may or may not work, and `spec/` has some unit tests that may also reveal something about expected behavior.

`grammar.ohm` contains the grammar, and `grammar.js` contains the Ohm semantics that transform the AST into Storyboard-compatible JSON.

## License
This project is licensed under the MIT license. See the LICENSE file for more info.


## Contact
* https://github.com/lazerwalker
* https://twitter.com/lazerwalker