// imports
import * as builders from './assertions/builders'
import {
  OPTIMIZED,
  isArray, isBoolean, isEnum, isNull, isObject, isParentKeyword, isPathFragment,
  isRef, isSchemaType, isSubSchema, isString, isUndefined
} from './assertions/types'
import { getSchema } from './utils'

// "private" properties
const ERRORS = Symbol('cache of all errors as they occurred during validation')
const REFS = Symbol('cache of all referenced schemas in current schema')

// "private" methods
const VALIDATE = Symbol('validate schemas')

const ASSIGN_SCHEMA = Symbol('assigns schema definitions to the class instance')
const ASSIGN_REF = Symbol('assigns a ref to ref cache')
const ASSIGN_REFS = Symbol('assigns a Hash of refs to ref cache')
const ASSIGN_OPTIMIZED = Symbol('assigns schema optimizations and/or references')

const ASSERT_SCHEMA = Symbol('validates schema types')
const ASSERT_REF = Symbol('validates schema $ref')
const ASSERT_REF_ABSOLUTE = Symbol('validates schema $ref with absolute URLs')
const ASSERT_REF_RELATIVE = Symbol('validates schema $ref with relative URLs')
const ASSERT_REF_POINTER = Symbol('validates schema $ref with JSON pointers')
const ASSERT_TYPE = Symbol('validates Schema type arrays')

// constants
const enumerable = true

/**
 * @todo Finish documenting remaining "private" methods, dependant functions and Builder classes.
 *
 * Class representing the definition and validation methods for JSON Schema validation.
 * @property {Array<string>} errors - A copy of the List of error strings from the last time `validate` ran.
 * @param {Object} [schema] - Optional JSON Schema definition.
 * @param {Object} [refs] - Optional hash of cached JSON Schemas that are referenced in the main schema.
 * @param {Boolean} [async] - Optional boolean flag to enable asynchronous validations.
 * @example <caption>An example Schema initialized immediately.</caption>
 * ...
 * const schema = await new Schema({}) // immediately immutable
 * ...
 * @example <caption>An example Schema initialized immediately with cached JSON Schema references defined.</caption>
 * ...
 * const REFS = {
 *   'https://localhost/schema': {}
 * }
 * const schema = await new Schema({ $ref: 'https://localhost/schema' }, REFS) // immediately immutable
 * ...
 * @example <caption>An example Schema initialized lazily.</caption>
 * ...
 * const schema = await new Schema() // executes immediately, but not immutable yet...
 * ...
 * await schema.assign({}) // now it's immutable
 * ...
 * @example <caption>An example Schema initialized lazily with cached JSON Schema references defined.</caption>
 * ...
 * const schema = await new Schema() // executes immediately, but not immutable yet...
 * ...
 * const REFS = {
 *   'https://localhost/schema': {}
 * }
 * await schema.assign({ $ref: 'https://localhost/schema' }, REFS) // now it's immutable
 * ...
 */
class Schema {
  constructor (isAsync) {
    Object.defineProperties(this, {
      [ERRORS]: { value: [] },
      [REFS]: { value: {} },
      validate: { value: isAsync ? async () => this[VALIDATE] : this[VALIDATE] }
    })
  }

  get errors () {
    return [...this[ERRORS]]
  }

  /**
   * [`async`] Method used to define and optimize the JSON Schema instance with the supplied JSON Schema definition and optionially cached references of other JSON Schema definitions.
   * @param {Object} schema - The supplied JSON Schema definition.
   * @param {Object} [refs] - Optionally supplied cached references of other JSON Schema definitions.
   * @returns {Schema} The instance of the JSON Schema definition.
   */
  async assign (schema, refs) {
    if (isObject(refs)) await this[ASSIGN_REFS](refs)

    this[ASSIGN_SCHEMA](this, schema)

    const schemaId = schema.$id || schema.id
    if (isString(schemaId)) Object.defineProperty(this[REFS], schemaId, { value: this, enumerable })

    await this[ASSIGN_OPTIMIZED](this)
    Object.freeze(this[REFS])

    return this
  }

  /**
   * [`async`] Method used to validate supplied data against the JSON Schema definition instance.
   * @param data - The data to validate against the JSON Schema definition instance.
   * @param {Schema} [schema=this] - Optionally pass nested JSON Schema definitions of the instance for partial schema validation or other instances of the JSON Schema class.
   * @returns {boolean} `true` if validation is successful, otherwise `false`.
   */
  [VALIDATE] (data, schema = this) {
    this[ERRORS].length = 0

    if (schema === false) this[ERRORS].push('\'false\' Schema invalidates all values')
    else if (schema[OPTIMIZED]) {
      if (schema[OPTIMIZED].length === 1) {
        const error = schema[OPTIMIZED][0](data, schema)
        if (error) this[ERRORS].push(error.message)
      } else {
        for (let fn of schema[OPTIMIZED]) {
          const error = fn(data, schema)
          if (error) {
            this[ERRORS].push(error.message)
            break
          }
        }
      }
    }

    return !this[ERRORS].length
  }

  /**
   * @private
   * Iteratively assigns the provided JSON Schema definition to the root of the instance JSON Schema object.
   * @param {Object} root - The root of the instance JSON Schema object.
   * @param {Object} schema - The JSON Schema definition about to be assigned.
   */
  [ASSIGN_SCHEMA] (root, schema) {
    if (!isObject(schema)) throw new TypeError('JSON Schemas must be an Object at root')

    // iterate over object/array passed as source schema
    const assign = (object, source, path = []) => {
      const keys = Object.keys(source)
      for (let key of keys) {
        const value = source[key]
        if (value && typeof value === 'object') {
          Object.defineProperty(object, key, {
            value: isArray(value)
              ? assign([], value, [...path, key])
              : assign({}, value, [...path, key]),
            enumerable
          })
        } else Object.defineProperty(object, key, { value, enumerable })
      }

      const tempId = source.$id || source.id
      if (isString(tempId) && isSubSchema(tempId, path)) {
        Object.defineProperty(this[REFS], tempId, { value: object, enumerable })
      }

      return object
    }
    assign(root, schema)
  }

  async [ASSIGN_REF] (schemaUrl, ref) {
    Object.defineProperty(this[REFS], schemaUrl, { value: {}, enumerable })
    this[ASSIGN_SCHEMA](this[REFS][schemaUrl], ref)
    return this[ASSIGN_OPTIMIZED](this[REFS][schemaUrl])
  }

  async [ASSIGN_REFS] (refs) {
    const keys = Object.keys(refs)
    for (let schemaUrl of keys) await this[ASSIGN_REF](schemaUrl, refs[schemaUrl])
  }

  async [ASSIGN_OPTIMIZED] (schema) {
    const schemaId = schema.$id || schema.id

    const assign = async (source, path = []) => {
      if (isObject(source) && !isParentKeyword(path)) {
        const { $id, $ref, id } = source
        let value = []

        if (!isUndefined($ref)) value.push(...(await this[ASSERT_REF]($ref, schema, path)))
        else {
          value.push(...this[ASSERT_SCHEMA](source))

          const tempId = $id || id
          if (!isUndefined(tempId) && tempId !== schemaId) {
            value.push(...(await this[ASSERT_REF](tempId, schema, path)))
          }
        }

        Object.defineProperty(source, OPTIMIZED, { value })
        Object.freeze(source[OPTIMIZED])
      }

      const keys = Object.keys(source)
      for (let key of keys) {
        const value = source[key]
        if (value && typeof value === 'object') await assign(value, [...path, key])
      }
      return Object.freeze(source)
    }
    return assign(schema)
  }

  /*
   * ref assertions
   */
  async [ASSERT_REF] ($ref, root, path) {
    if (!isString($ref)) throw new TypeError('#$ref: must be a string')
    if (isPathFragment($ref)) return []

    const match = isRef($ref)
    if (isNull(match)) throw new SyntaxError('#$ref: is malformed')

    let assertion = {}
    if ($ref[0] === '#') assertion = this[ASSERT_REF_POINTER](match[0].split('#')[1], root)
    else if (match[1] && match[2]) assertion = await this[ASSERT_REF_ABSOLUTE](match)
    else assertion = await this[ASSERT_REF_RELATIVE](match, root, path)

    const { referred, list } = assertion
    if (list.length && isObject(referred)) {
      return [value => {
        if (list.length === 1) {
          const error = list[0](value, referred)
          if (error) return error
        } else {
          for (let fn of list) {
            const error = fn(value, referred)
            if (error) return error
          }
        }
      }]
    } else if (referred === false) {
      return [() => { return new Error('\'false\' Schema invalidates all values') }]
    }
    return []
  }

  async [ASSERT_REF_ABSOLUTE] (match) {
    const schemaUrl = match[0].split('#')[0]
    const secure = match[2] === 'https'

    let referred = this[REFS][schemaUrl]
    if (isUndefined(referred)) {
      const schema = await getSchema(schemaUrl, secure)
      referred = await this[ASSIGN_REF](schemaUrl, schema)
    }

    if (match[3].indexOf('#') !== -1) {
      return this[ASSERT_REF_POINTER](match[3].split('#')[1], referred)
    }

    const list = this[ASSERT_SCHEMA](referred)
    return { referred, list }
  }

  async [ASSERT_REF_RELATIVE] (match, root, path) {
    let absMatch
    if (isString(root.$id)) absMatch = isRef(root.$id)
    else if (isString(root.id)) absMatch = isRef(root.id)

    // build Schema path by traversing schema from root, checking for ($)id path fragments
    let temp = absMatch[1]
    let index = root
    for (let key of path) {
      index = index[key]
      if (isString(index.$id) && isPathFragment(index.$id)) temp = `${temp}${index.$id}`
      else if (isString(index.id) && isPathFragment(index.id)) temp = `${temp}${index.id}`
    }

    absMatch[0] = `${temp}${match[0]}`
    absMatch[3] = `${match[0]}`

    return this[ASSERT_REF_ABSOLUTE](absMatch)
  }

  [ASSERT_REF_POINTER] (pointer, root) {
    // recursive traversal of root in case of recursive references
    const traverse = (ptr) => {
      let ref = root
      const keys = ptr.split('/')

      keys.shift()
      if (keys.length) {
        for (let key of keys) ref = ref[key.replace(/~1/g, '/').replace(/~0/g, '~')]
      }

      if (ref.$ref) return traverse(ref.$ref.split('#')[1])
      return ref
    }

    const referred = traverse(pointer)
    const list = this[ASSERT_SCHEMA](referred)
    return { referred, list }
  }

  /*
   * schema assertions
   */
  [ASSERT_SCHEMA] (schema) {
    const list = []

    // assert schema type
    if (!isUndefined(schema.type)) list.push(...this[ASSERT_TYPE](schema))

    // assert schema for generic and primitive type keywords
    list.push(...builders.AssertGeneric.optimize(schema))
    list.push(...builders.AssertBoolean.optimize(schema))
    list.push(...builders.AssertNull.optimize(schema))
    list.push(...builders.AssertNumber.optimize(schema))
    list.push(...builders.AssertString.optimize(schema))

    // assert schema for complex type keywords
    list.push(...builders.AssertArray.optimize(schema))
    list.push(...builders.AssertObject.optimize(schema))

    // assert schema for logical operation keywords
    list.push(...builders.AssertLogical.optimizeAllOf(schema))
    list.push(...builders.AssertLogical.optimizeAnyOf(schema))
    list.push(...builders.AssertLogical.optimizeNot(schema))
    list.push(...builders.AssertLogical.optimizeOneOf(schema))

    return list
  }

  /*
   * type assertions
   */
  [ASSERT_TYPE] (schema) {
    const { type } = schema

    // assert schema type
    if (isString(type)) {
      if (!isSchemaType(type)) throw new ReferenceError(`#type: '${type}' is not a valid JSON Schema type`)
      return []
    } else if (isArray(type)) {
      if (!isEnum(type, isSchemaType)) throw new TypeError('#type: type arrays must contain only string')

      const list = type.map(val => this[ASSERT_SCHEMA]({ type: val })[0])
      return [(value, ref) => {
        for (let fn of list) if (!fn(value, ref)) return
        return new Error('#type: value does not match the List of types')
      }]
    } else throw new TypeError('#type: must be either a valid type string or list of strings')
  }
}

/*
 * Proxy<Schema> for async initialization of the schema and optional refs
 */
export default new Proxy(Schema, {
  construct: async function (Schema, argsList) {
    if (isUndefined(argsList[0]) || isBoolean(argsList[0])) return new Schema(argsList[0])
    if (isBoolean(argsList[1])) return new Schema(argsList[1]).assign(argsList[0])
    return new Schema(argsList[2]).assign(argsList[0], argsList[1])
  }
})
