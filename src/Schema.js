// imports
import * as builders from './assertions/builders'
import {
  OPTIMIZED, assertOptimized,
  isArray, isEnum, isNull, isObject, isParentKeyword, isPathFragment,
  isRef, isSchemaType, isSubSchema, isString, isUndefined
} from './assertions/types'
import { getSchema } from './utils'

// private properties
const ERRORS = Symbol('cache of all errors as they occurred during validation')
const REFS = Symbol('cache of all referenced schemas in current schema')

// private methods
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

/*
 * Schema class
 */
export default class Schema {
  constructor () {
    Object.defineProperties(this, {
      [ERRORS]: { value: [] },
      [REFS]: { value: {} }
    })
  }

  /*
   * getter(s)/setter(s)
   */
  get errors () {
    return [...this[ERRORS]]
  }

  /*
   * validate
   */
  async validate (data, schema = this) {
    this[ERRORS].length = 0
    await assertOptimized(data, schema, schema[OPTIMIZED], this[ERRORS])
    return !this[ERRORS].length
  }

  /*
   * assign methods
   */
  async assign (schema, refs) {
    if (isObject(refs)) await this[ASSIGN_REFS](refs)

    this[ASSIGN_SCHEMA](this, schema)
    const schemaId = schema.$id || schema.id
    if (isString(schemaId)) Object.defineProperty(this[REFS], schemaId, { value: this, enumerable: true })

    await this[ASSIGN_OPTIMIZED](this)
    return this
  }

  [ASSIGN_SCHEMA] (root, schema) {
    if (!isObject(schema)) throw new TypeError('JSON Schemas must be an Object at root')

    // iterate over object/array passed as source schema
    const assign = (object, source, path = []) => {
      const keys = Object.keys(source)
      for (let key of keys) {
        const value = source[key]
        if (value && typeof value === 'object') {
          Object.defineProperty(object, key, {
            value: isArray(value) ? assign([], value, [...path, key]) : assign({}, value, [...path, key]),
            enumerable: true
          })
        } else Object.defineProperty(object, key, { value, enumerable: true })
      }

      const tempId = source.$id || source.id
      if (isString(tempId) && isSubSchema(tempId, path)) {
        Object.defineProperty(this[REFS], tempId, { value: object, enumerable: true })
      }

      return object
    }
    assign(root, schema)
  }

  async [ASSIGN_REF] (schemaUrl, ref) {
    Object.defineProperty(this[REFS], schemaUrl, { value: {}, enumerable: true })
    this[ASSIGN_SCHEMA](this[REFS][schemaUrl], ref)
    await this[ASSIGN_OPTIMIZED](this[REFS][schemaUrl])
    return this[REFS][schemaUrl]
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
      }

      const keys = Object.keys(source)
      for (let key of keys) {
        const value = source[key]
        if (value && typeof value === 'object') await assign(value, [...path, key])
      }
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
      return [async (value, ref, errors) => {
        return assertOptimized(value, referred, list, errors)
      }]
    } else if (referred === false) {
      return [async (value, ref, errors) => {
        return errors.push('\'false\' Schema invalidates all values')
      }]
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

    // assert schema for generic and primitive keywords
    list.push(...builders.AssertGeneric.optimize(schema))
    list.push(...builders.AssertArray.optimize(schema))
    list.push(...builders.AssertBoolean.optimize(schema))
    list.push(...builders.AssertNull.optimize(schema))
    list.push(...builders.AssertNumber.optimize(schema))
    list.push(...builders.AssertObject.optimize(schema))
    list.push(...builders.AssertString.optimize(schema))

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
      return [async (value, ref, errors) => {
        let err = []
        for (let fn of list) {
          await fn(value, ref, err)
        }
        if (err.length === list.length) errors.push(...err)
      }]
    } else throw new TypeError('#type: must be either a valid type string or list of strings')
  }
}
