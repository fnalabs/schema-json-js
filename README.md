# Schema(JSON)<sup>js</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![BrowserStack Status][browserstack-image]][browserstack-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

A JavaScript Schema class that implements the JSON Schema specification as immutable objects with lazy, async initialization. The class creates optimized validations using closures and thunks. It currently supports the `draft-04` and `draft-06` versions of the JSON Schema specification.

Motivations behind the project:
- implement a JSON Schema validator leveraging modern JS features
- implement as instances of a `class` so the schema can be referenced in code
- include support for `synchronous` or `asynchronous` validations
- allow for partial validations for complex object properties
- small and lightweight with no dependencies
- universal support for the latest browsers and Node.js
- fastest JSON Schema validator without code generation

#### Contents
- [Installing](#installing)
- [Examples](#examples)
- [API](#api)
- [Environments](#environments)
- [Benchmarks](#benchmarks)
- [Future](#future)
- [Contributing](#contributing)
- [Changelog](#changelog)

## Installing
Install using `npm`:
```sh
$ npm install --save schema-json-js
```

## Examples
Below are numerous examples on how to use the Schema class.

#### Initialized immediately:
---
- An example Schema initialized immediately.
  ```javascript
  // ...
  const schema = await new Schema({}) // immediately immutable
  // ...
  schema.validate('something')
  // ...
  ```

- An example Schema initialized immediately with cached JSON Schema references defined.
  ```javascript
  // ...
  const REFS = {
    'https://localhost/schema': {}
  }
  const schema = await new Schema({ $ref: 'https://localhost/schema' }, REFS) // immediately immutable
  // ...
  schema.validate('something')
  // ...
  ```

- An example Schema initialized immediately with `async` validation.
  ```javascript
  // ...
  const schema = await new Schema({}, true) // immediately immutable
  // ...
  await schema.validate('something')
  // ...
  ```

- An example Schema initialized immediately with cached JSON Schema references defined and `async` validation.
  ```javascript
  // ...
  const REFS = {
    'https://localhost/schema': {}
  }
  const schema = await new Schema({ $ref: 'https://localhost/schema' }, REFS, true) // immediately immutable
  // ...
  await schema.validate('something')
  // ...
  ```

#### Initialized lazily:
---
- An example Schema initialized lazily.
  ```javascript
  // ...
  const schema = await new Schema() // not immutable yet...
  // ...
  await schema.assign({}) // now it's immutable
  // ...
  schema.validate('something')
  // ...
  ```

- An example Schema initialized lazily with cached JSON Schema references defined.
  ```javascript
  // ...
  const schema = await new Schema() // not immutable yet...
  // ...
  const REFS = {
    'https://localhost/schema': {}
  }
  await schema.assign({ $ref: 'https://localhost/schema' }, REFS) // now it's immutable
  // ...
  schema.validate('something')
  // ...
  ```

- An example Schema initialized lazily with `async` validation.
  ```javascript
  // ...
  const schema = await new Schema(true) // not immutable yet...
  // ...
  await schema.assign({}) // now it's immutable
  // ...
  await schema.validate('something')
  // ...
  ```

## API
- [Schema](https://fnalabs.github.io/schema-json-js/Schema.html)

## Environments
- All modern browsers and Node 8+ without polyfills.

## Benchmarks
There is a small benchmark to showcase our performance against some similar solutions. One of the many ways `schema-json-js` stands apart from many other validators is its ability to perform partial schema validation.
- Node.js
    - [as cached Schema instance](https://fnalabs.github.io/schema-json-js/node.validate.html)
    - [as serialized Schema instance](https://fnalabs.github.io/schema-json-js/node.serialize.html)
- Browsers
    - Chrome
        - [as cached Schema instance](https://fnalabs.github.io/schema-json-js/chrome.validate.html)
        - [as serialized Schema instance](https://fnalabs.github.io/schema-json-js/chrome.serialize.html)
    - Firefox
        - [as cached Schema instance](https://fnalabs.github.io/schema-json-js/firefox.validate.html)
        - [as serialized Schema instance](https://fnalabs.github.io/schema-json-js/firefox.serialize.html)

## Future
- create documentation and contributing guide
- implement support for the `draft-07` JSON Schema specification
- feature requests via [issues](https://github.com/fnalabs/schema-json-js/issues)

## Contributing
We are currently drafting our contributing guide!

*Browser compatibility testing provided by:*

<a href="https://browserstack.com"><img height="48" src="https://fnalabs.github.io/fnalabs-assets/assets/Browserstack-logo.svg" alt="BrowserStack logo"></a>

## Changelog
#### v0.3.0
- updated documentation
- updated JSON Schema Test Suite
- published benchmarks with similar solutions
- improved error messaging
- greatly improved performance by refactoring to:
    - improve memory management in complex object validations
    - reduce logic for strongly-typed schemas
    - improve loops

#### v0.2.0
- updated documentation
- implemented `sync` and `async` validation options
- performance updates:
    - removed nested `async` functions
    - removed all try...catch statements from loops
    - comparison and structural improvements

#### v0.1.1
- added browser unit test coverage for `Schema` in all evergreen browsers, desktop and mobile
- updated dev dependencies

#### v0.1.0
- added browser tests for most recent Chrome and Firefox

#### v0.0.0-beta.1
- added documentation

[npm-image]: https://img.shields.io/npm/v/schema-json-js.svg
[npm-url]: https://www.npmjs.com/package/schema-json-js

[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: https://github.com/fnalabs/schema-json-js/blob/master/LICENSE

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/schema-json-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/schema-json-js

[browserstack-image]: https://www.browserstack.com/automate/badge.svg?badge_key=eDlQNTJyWmtKUGY4dUVkUE1KU0xYdlhsWEQ1RmhtUVhCb285NWpla2picz0tLVBUZ0orditWQXNFWS9tNnNPNUVQREE9PQ==--7be9058ed16408dc5a4ee811336e7c48e21631d7
[browserstack-url]: https://www.browserstack.com/automate/public-build/eDlQNTJyWmtKUGY4dUVkUE1KU0xYdlhsWEQ1RmhtUVhCb285NWpla2picz0tLVBUZ0orditWQXNFWS9tNnNPNUVQREE9PQ==--7be9058ed16408dc5a4ee811336e7c48e21631d7

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/schema-json-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/schema-json-js

[depstat-image]: https://img.shields.io/david/fnalabs/schema-json-js.svg
[depstat-url]: https://david-dm.org/fnalabs/schema-json-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
