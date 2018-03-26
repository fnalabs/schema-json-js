# schema(JSON)<sup>js</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

A JavaScript Schema class that implements the JSON Schema specification as immutable objects with lazy, async initialization and optimized validations using promises and thunks. It currently supports the `draft-04` and `draft-06` versions of the JSON Schema specification.

Motivations behind the project:
- implement a JSON Schema validator leveraging modern JS features
- implement as instances of a `class` so the schema can be referenced in code
- fully asynchronous from the ground up
- small and lightweight with no dependencies

#### Contents
- [Installing](#installing)
- [API](#api)
- [Examples](#examples)
- [Future](#future)
- [Changelog](#changelog)

## Installing
Install using `npm`:
```sh
$ npm install schema-json-js
```

### [API](https://fnalabs.github.io/schema-json-js/)
Click on the link in the header above to go to the API page.

## Examples
- An example Schema initialized immediately.
  ```javascript
  // ...
  const schema = await new Schema({}) // immediately immutable
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
  ```

- An example Schema initialized lazily.
  ```javascript
  // ...
  const schema = await new Schema() // not immutable yet...
  // ...
  await schema.assign({}) // now it's immutable
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
  ```

## Future
- finish documentation
- benchmarks
- implement support for the `draft-07` JSON Schema specification
- feature requests via [issues](https://github.com/fnalabs/schema-json-js/issues)

## Changelog
TODO

[npm-image]: https://img.shields.io/npm/v/schema-json-js.svg
[npm-url]: https://www.npmjs.com/package/schema-json-js

[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: https://github.com/fnalabs/schema-json-js/blob/master/LICENSE

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/schema-json-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/schema-json-js

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/schema-json-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/schema-json-js

[depstat-image]: https://img.shields.io/david/fnalabs/schema-json-js.svg
[depstat-url]: https://david-dm.org/fnalabs/schema-json-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
