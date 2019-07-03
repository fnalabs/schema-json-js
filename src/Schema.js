// imports
import * as builders from './assertions/builders'
import {
  OPTIMIZED,
  isArray, isBoolean, isEnum, isNull, isObject, isParentKeyword, isPathFragment,
  isRef, isSchemaType, isSubSchema, isString, isUndefined
} from './assertions/types'
import { getSchema } from './utils'

// "private" properties
const ASYNC = Symbol('cache of async setting')
const ERRORS = Symbol('cache of all errors as they occurred during validation')
const REFS = Symbol('cache of all referenced schemas in current schema')

// "private" methods
const VALIDATE = Symbol('validates schema')

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
 * <p>Class representing the definition and assertion methods for JSON Schema validation. Creates an immutable instance of a JSON Schema either immediately or lazily depending on your needs. When assigning a JSON Schema, it first validates the JSON Schema definition. Then it creates optimized assertion methods for each verified JSON Schema defined either at the root of the Schema or nested within complex Schemas. This allows for faster validations and the ability to perform partial Schema validations for nested definitions to test a change to a Model.</p>
 * <p>There are many ways to create a Schema instance, either instantly or lazily. The Schema class also supports fetching remote referenced JSON Schemas on a supported web client or Node.js service. Be mindful of the argument order, if omitting <code>schema</code> and/or <code>refs</code>, the desired arguments need to maintain the order in which they are defined.</p>
 * @property {Array<string>} errors - A copy of the List of error strings from the last time {@link validate} ran.
 * @property {boolean} isAsync=false - A copy of the <code>async</code> validation setting.
 * @param {Object} [schema] - Optional JSON Schema definition.
 * @param {Object} [refs] - Optional hash of cached JSON Schemas that are referenced in the main schema.
 * @param {boolean} [async=false] - Optional boolean flag to enable asynchronous validations.
 * @async
 */
class Schema {
  constructor (isAsync = false) {
    Object.defineProperties(this, {
      [ASYNC]: { value: isAsync },
      [ERRORS]: { value: [] },
      [REFS]: { value: {} }
    })

    isAsync
      ? Object.defineProperty(this, 'validate', {
        value: async (data, schema) => this[VALIDATE](data, schema)
      })
      : Object.defineProperty(this, 'validate', {
        value: (data, schema) => this[VALIDATE](data, schema)
      })
  }

  get errors () {
    return [...this[ERRORS]]
  }

  get isAsync () {
    return this[ASYNC]
  }

  /**
   * Method used to define and optimize the JSON Schema instance with the supplied JSON Schema definition and optionially cached references of other JSON Schema definitions.
   * @param {Object} schema - The supplied JSON Schema definition.
   * @param {Object} [refs] - Optionally supplied cached references of other JSON Schema definitions.
   * @returns {Schema} The instance of the JSON Schema definition.
   * @async
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
   * Method used to validate supplied data against the JSON Schema definition instance. Can be configured to be either <code>synchronous</code> or <code>asynchronous</code> using a wrapping function during construction. It defaults to <code>synchronous</code> for better performance.
   * @function Schema.prototype.validate
   * @param data - The data to validate against the JSON Schema definition instance.
   * @param {Schema} [schema=this] - Optionally pass nested JSON Schema definitions of the instance for partial schema validation or other instances of the JSON Schema class.
   * @returns {boolean} <code>true</code> if validation is successful, otherwise <code>false</code>.
   * @async
   */
  [VALIDATE] (data, schema = this) {
    this[ERRORS].length = 0

    if (schema === false) this[ERRORS].push('\'false\' JSON Schema invalidates all values')
    else if (schema[OPTIMIZED]) {
      this[ERRORS].push(schema[OPTIMIZED](data, schema))
      if (!this[ERRORS][this[ERRORS].length - 1]) this[ERRORS].pop()
    }

    return !this[ERRORS].length
  }

  /**
   * Iteratively assigns the provided JSON Schema definition to the root of the instance JSON Schema object.
   * @param {Object} root - The root of the instance JSON Schema object.
   * @param {Object} schema - The JSON Schema definition about to be assigned.
   * @private
   */
  [ASSIGN_SCHEMA] (root, schema) {
    if (!isObject(schema)) throw new TypeError('JSON Schemas must be an object at root')

    // iterate over object/array passed as source schema
    const assign = (object, source, path = []) => {
      const keys = Object.keys(source)
      let index = keys.length
      while (index--) {
        const value = source[keys[index]]
        if (value && typeof value === 'object') {
          Object.defineProperty(object, keys[index], {
            value: isArray(value)
              ? assign([], value, [...path, keys[index]])
              : assign({}, value, [...path, keys[index]]),
            enumerable
          })
        } else Object.defineProperty(object, keys[index], { value, enumerable })
      }

      const tempId = source.$id || source.id
      if (isString(tempId) && isSubSchema(tempId, path)) {
        Object.defineProperty(this[REFS], tempId, { value: object, enumerable })
      }

      return object
    }
    assign(root, schema)
  }

  /**
   * Assigns an in-memory reference to a <code>ref</code> using its JSON Schema URL.
   * @param {String} schemaUrl - The JSON Schema URL to associate the <code>ref</code> with.
   * @param {Object} ref - A valid JSON Schema.
   * @private
   */
  async [ASSIGN_REF] (schemaUrl, ref) {
    Object.defineProperty(this[REFS], schemaUrl, { value: {}, enumerable })
    this[ASSIGN_SCHEMA](this[REFS][schemaUrl], ref)
    return this[ASSIGN_OPTIMIZED](this[REFS][schemaUrl])
  }

  /**
   * Iterates over a <code>refs</code> object literal to assign a cached reference to all JSON Schema <code>refs</code> for this Schema.
   * @param {Object} refs - An object literal containing the schemaUrl and matching JSON Schemas for all refs.
   * @private
   */
  async [ASSIGN_REFS] (refs) {
    const keys = Object.keys(refs)
    let index = keys.length
    while (index--) await this[ASSIGN_REF](keys[index], refs[keys[index]])
  }

  /**
   * Iterates over the Schema object to add optimized cached assertions to each layer of a valid JSON Schema.
   * @param {Object} schema - A valid JSON Schema instance.
   * @private
   */
  async [ASSIGN_OPTIMIZED] (schema) {
    const schemaId = schema.$id || schema.id

    const assign = async (source, path = []) => {
      if (isObject(source) && !isParentKeyword(path)) {
        const { $id, $ref, id } = source
        let list = []
        let value

        if (!isUndefined($ref)) list.push(...(await this[ASSERT_REF]($ref, schema, path)))
        else {
          list.push(this[ASSERT_SCHEMA](source))

          const tempId = $id || id
          if (!isUndefined(tempId) && tempId !== schemaId) {
            list.push(...(await this[ASSERT_REF](tempId, schema, path)))
          }
        }

        if (list.length) {
          value = list.length === 1
            ? list.pop()
            : (data, schema) => {
              let i = list.length
              let error
              while (i--) {
                error = list[i](data, schema)
                if (error) return error
              }
            }

          Object.defineProperty(source, OPTIMIZED, { value })
          Object.freeze(source[OPTIMIZED])
        }
      }

      const keys = Object.keys(source)
      let index = keys.length
      while (index--) {
        const value = source[keys[index]]
        if (value && typeof value === 'object') await assign(value, [...path, keys[index]])
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

    const { referred, fn } = assertion
    if (fn && isObject(referred)) {
      return [value => fn(value, referred)]
    } else if (referred === false) {
      return [() => '\'false\' JSON Schema invalidates all values']
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

    const fn = this[ASSERT_SCHEMA](referred)
    return { referred, fn }
  }

  async [ASSERT_REF_RELATIVE] (match, root, path) {
    let absMatch
    if (isString(root.$id)) absMatch = isRef(root.$id)
    else if (isString(root.id)) absMatch = isRef(root.id)

    // build Schema path by traversing schema from root, checking for ($)id path fragments
    let temp = absMatch[1]
    let schema = root
    for (let index = 0, length = path.length; index < length; index++) {
      schema = schema[path[index]]
      if (isString(schema.$id) && isPathFragment(schema.$id)) temp = `${temp}${schema.$id}`
      else if (isString(schema.id) && isPathFragment(schema.id)) temp = `${temp}${schema.id}`
    }

    absMatch[0] = `${temp}${match[0]}`
    absMatch[3] = `${match[0]}`

    return this[ASSERT_REF_ABSOLUTE](absMatch)
  }

  [ASSERT_REF_POINTER] (pointer, root) {
    // recursive traversal of root in case of recursive references
    const traverse = (ptr) => {
      const keys = ptr.split('/')
      let ref = root

      keys.shift()
      if (keys.length) {
        // NOTE: must be a incrementing loop since we need to traverse in order
        for (let index = 0, length = keys.length; index < length; index++) {
          ref = ref[keys[index].replace(/~1/g, '/').replace(/~0/g, '~')]
        }
      }

      if (ref.$ref) return traverse(ref.$ref.split('#')[1])
      return ref
    }

    const referred = traverse(pointer)
    const fn = this[ASSERT_SCHEMA](referred)
    return { referred, fn }
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

    return list.length === 1
      ? list.pop()
      : (data, schema) => {
        let i = list.length
        let error
        while (i--) {
          error = list[i](data, schema)
          if (error) return error
        }
      }
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

      const list = type.map(val => this[ASSERT_SCHEMA]({ type: val }))
      return [(value, ref) => {
        let index = list.length
        while (index--) if (!list[index](value, ref)) return
        return '#type: value does not match the List of types'
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
