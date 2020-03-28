# Schema(JSON)<sup>js</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
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

## [API](https://fnalabs.github.io/schema-json-js/)
- [Schema](https://fnalabs.github.io/schema-json-js/Schema.html)

## Environments
- All modern browsers and Node 10+ without polyfills.
- The build script is currently set to ECMA 9.

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
- implement support for the `draft-07` and `2019-09` JSON Schema specification
- feature requests via [issues](https://github.com/fnalabs/schema-json-js/issues)

## Contributing
We are currently drafting our contributing guide!

## [Changelog](https://github.com/fnalabs/schema-json-js/releases)

[npm-image]: https://img.shields.io/npm/v/schema-json-js.svg
[npm-url]: https://www.npmjs.com/package/schema-json-js

[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: https://github.com/fnalabs/schema-json-js/blob/master/LICENSE

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/schema-json-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/schema-json-js

[depstat-image]: https://img.shields.io/david/fnalabs/schema-json-js.svg
[depstat-url]: https://david-dm.org/fnalabs/schema-json-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
