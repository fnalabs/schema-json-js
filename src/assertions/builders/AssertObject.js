import {
  OPTIMIZED, assertOptimized, assertSizeMax, assertSizeMin,
  isArray, isBoolean, isEnum, isObject, isSchema, isString, isTypedArray, isUndefined
} from '../types'

// private methods
const ASSERT_DEPENDENCIES = Symbol('valiates Object dependencies')
const ASSERT_KEYS = Symbol('validates Object keys')
const ASSERT_PROPERTIES = Symbol('validates Object properties')
const ASSERT_REQUIRED = Symbol('validates Object required')

export default class AssertObject {
  constructor () {
    return AssertObject
  }

  /*
   * object assertions
   */
  static optimize (schema) {
    const { type, dependencies, maxProperties, minProperties, propertyNames, required } = schema
    const innerList = []
    const outerList = []

    // assert and optimize property-processing keywords in schema
    innerList.push(...AssertObject[ASSERT_PROPERTIES](schema))
    if (!isUndefined(dependencies)) innerList.push(AssertObject[ASSERT_DEPENDENCIES](dependencies))
    if (!isUndefined(propertyNames)) {
      innerList.push(AssertObject[ASSERT_KEYS](propertyNames))
    }

    // assert and optimize post-processing keywords in schema
    const { req, assertReq } = AssertObject[ASSERT_REQUIRED](required)
    if (!isUndefined(assertReq)) outerList.push(assertReq)
    if (!isUndefined(maxProperties)) outerList.push(assertSizeMax(maxProperties, 'maxProperties'))
    if (!isUndefined(minProperties)) outerList.push(assertSizeMin(minProperties, 'minProperties'))

    // return validations based on defined keywords
    if (innerList.length || outerList.length) {
      return [async (value, ref, errors) => {
        if (!isObject(value)) {
          if (ref.type === 'object') errors.push('#type: value is not an object')
          return
        }

        const keys = Object.keys(value)
        const length = keys.length
        let reqCount = 0

        if (innerList.length || Object.keys(req).length) {
          for (let key of keys) {
            const val = value[key]
            // check for required
            if (req[key]) reqCount++
            // asserts [properties, patternProperties, additionalProperties, dependencies, propertyNames]
            if (innerList.length) await assertOptimized([value, key, val], ref, innerList, errors)
          }
        }

        // asserts [required, maxProperties, minProperties]
        if (outerList.length) {
          await assertOptimized({ length, reqCount }, ref, outerList, errors)
        }
      }]
    } else if (type === 'object') {
      return [async (value, ref, errors) =>
        !isObject(value) && errors.push('#type: value is not an object')]
    }
    return []
  }

  static [ASSERT_DEPENDENCIES] (dependencies) {
    // determine if dependencies object contains arrays or schemas
    const keys = Object.keys(dependencies)
    for (let k of keys) {
      const value = dependencies[k]
      if (!(isEnum(value, isString) || isSchema(value))) {
        throw new TypeError('#dependencies: all dependencies must either be Schemas|enums')
      }
    }

    // return either property dependencies or schema dependencies validations
    return async ([value, key, val], ref, errors) => {
      if (isUndefined(ref.dependencies[key])) return

      if (isArray(ref.dependencies[key])) {
        for (let depKey of ref.dependencies[key]) {
          isUndefined(value[depKey]) &&
            errors.push(`#dependencies: value does not have '${key}' dependency`)
        }
      } else assertOptimized(value, ref.dependencies[key], ref.dependencies[key][OPTIMIZED], errors)
    }
  }

  static [ASSERT_KEYS] (propertyNames) {
    if (!isSchema(propertyNames)) {
      throw new TypeError('#propertyNames: must be a Schema')
    }
    return async ([value, key, val], ref, errors) =>
      assertOptimized(key, ref.propertyNames, ref.propertyNames[OPTIMIZED], errors)
  }

  static [ASSERT_PROPERTIES] (schema) {
    const patternProps = {}
    const list = []
    let patternMatch = false

    // attach properties validations if keyword set
    if (isObject(schema.properties)) {
      list.push(async ([value, key, val], ref, errors) =>
        ref.properties[key] &&
          assertOptimized(val, ref.properties[key], ref.properties[key][OPTIMIZED], errors))
    } else if (!isUndefined(schema.properties)) throw new TypeError('#properties: must be an Object')

    if (isObject(schema.patternProperties)) {
      const keys = Object.keys(schema.patternProperties)
      for (let k of keys) {
        patternProps[k] = new RegExp(k)
      }
      list.push(async ([value, key, val], ref, errors) => {
        patternMatch = false
        for (let i of keys) {
          if (patternProps[i].test(key)) {
            patternMatch = true
            await assertOptimized(val, ref.patternProperties[i], ref.patternProperties[i][OPTIMIZED], errors)
          }
        }
      })
    } else if (!isUndefined(schema.patternProperties)) throw new TypeError('#patternProperties: must be an Object')

    // attach additionalProperties validations if keyword set
    if (isObject(schema.additionalProperties)) {
      list.push(async ([value, key, val], ref, errors) =>
        (!(ref.properties && ref.properties[key]) && !patternMatch) &&
          assertOptimized(val, ref.additionalProperties, ref.additionalProperties[OPTIMIZED], errors))
    } else if (isBoolean(schema.additionalProperties) && schema.additionalProperties === false) {
      list.push(async ([value, key, val], ref, errors) =>
        (!(ref.properties && ref.properties[key]) && !patternMatch) &&
          errors.push('#additionalProperties: additional properties not allowed'))
    } else if (!isUndefined(schema.additionalProperties)) throw new TypeError('#additionalProperties: must be either a Schema or Boolean')

    return list
  }

  static [ASSERT_REQUIRED] (list) {
    if (isUndefined(list)) return { req: {} }
    if (!isArray(list) || !isTypedArray(list, isString)) {
      throw new TypeError('#required: required properties must be defined in an array of strings')
    }

    return {
      req: list.reduce((obj, val) => {
        obj[val] = true
        return obj
      }, {}),
      assertReq: async (results, ref, errors) =>
        results.reqCount !== ref.required.length &&
          errors.push('#required: value does not have all required properties')
    }
  }
}
