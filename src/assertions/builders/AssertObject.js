import {
  OPTIMIZED, assertSizeMax, assertSizeMin,
  isArray, isEnum, isObject, isSchema, isString, isTypedArray, isUndefined
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
    const {
      type, properties, patternProperties, additionalProperties, dependencies, required,
      maxProperties, minProperties, propertyNames
    } = schema
    let patternProps = {}

    // assert and optimize property-processing keywords in schema
    if (!isUndefined(properties) || !isUndefined(patternProperties) || !isUndefined(additionalProperties)) {
      patternProps = AssertObject[ASSERT_PROPERTIES](schema)
    }
    if (!isUndefined(dependencies)) AssertObject[ASSERT_DEPENDENCIES](dependencies)
    if (!isUndefined(propertyNames)) AssertObject[ASSERT_KEYS](propertyNames)
    const req = AssertObject[ASSERT_REQUIRED](required)

    // assert and optimize post-processing keywords in schema
    if (!isUndefined(maxProperties)) assertSizeMax(maxProperties, 'maxProperties')
    if (!isUndefined(minProperties)) assertSizeMin(minProperties, 'minProperties')

    // return validations based on defined keywords
    if (properties || patternProperties || additionalProperties || additionalProperties === false || dependencies || propertyNames || propertyNames === false || (required && required.length)) {
      return [(value, ref) => {
        if (!isObject(value)) {
          if (ref.type === 'object') return new Error('#type: value is not an object')
          return
        }

        const keys = Object.keys(value)
        const length = keys.length
        let reqCount = 0
        let patternMatch = false
        let propertiesMatch = false

        // asserts [required, maxProperties, minProperties]
        if (typeof ref.maxProperties === 'number' && length > ref.maxProperties) {
          return new Error('#maxProperties: value maximum exceeded')
        }
        if (typeof ref.minProperties === 'number' && length < ref.minProperties) {
          return new Error('#minProperties: value minimum not met')
        }

        // loop runs assertions for [properties, patternProperties, additionalProperties, etc.]
        for (let key of keys) {
          const val = value[key]
          // check for required
          if (req[key]) reqCount++

          // asserts [properties]
          propertiesMatch = false
          if (ref.properties && (ref.properties[key] || ref.properties[key] === false)) {
            propertiesMatch = true
            if (ref.properties[key] === false) {
              return new Error('#properties: \'false\' Schema invalidates all values')
            }
            if (ref.properties[key][OPTIMIZED]) {
              if (ref.properties[key][OPTIMIZED].length === 1) {
                const error = ref.properties[key][OPTIMIZED][0](val, ref.properties[key])
                if (error) return error
              } else {
                for (let fn of ref.properties[key][OPTIMIZED]) {
                  const error = fn(val, ref.properties[key])
                  if (error) return error
                }
              }
            }
          }

          // asserts [patternProperties]
          if (ref.patternProperties) {
            patternMatch = false
            const propKeys = Object.keys(ref.patternProperties)
            for (let i of propKeys) {
              if (patternProps[i].test(key)) {
                patternMatch = true
                if (ref.patternProperties[i] === false) {
                  return new Error('#patternProperties: \'false\' Schema invalidates all values')
                }
                /* istanbul ignore else */
                if (ref.patternProperties[i][OPTIMIZED]) {
                  if (ref.patternProperties[i][OPTIMIZED].length === 1) {
                    const error = ref.patternProperties[i][OPTIMIZED][0](val, ref.patternProperties[i])
                    if (error) return error
                  } else {
                    for (let fn of ref.patternProperties[i][OPTIMIZED]) {
                      const error = fn(val, ref.patternProperties[i])
                      if (error) return error
                    }
                  }
                }
              }
            }
          }

          // asserts [additionalProperties]
          if ((ref.additionalProperties || ref.additionalProperties === false) && !(propertiesMatch || patternMatch)) {
            if (ref.additionalProperties === false) {
              return new Error('#additionalProperties: additional properties not allowed')
            }
            if (ref.additionalProperties[OPTIMIZED]) {
              if (ref.additionalProperties[OPTIMIZED].length === 1) {
                const error = ref.additionalProperties[OPTIMIZED][0](val, ref.additionalProperties)
                if (error) return error
              } else {
                for (let fn of ref.additionalProperties[OPTIMIZED]) {
                  const error = fn(val, ref.additionalProperties)
                  if (error) return error
                }
              }
            }
          }

          // asserts [dependencies]
          if (ref.dependencies && (ref.dependencies[key] || ref.dependencies[key] === false)) {
            if (Array.isArray(ref.dependencies[key])) {
              for (let depKey of ref.dependencies[key]) {
                if (typeof value[depKey] === 'undefined') {
                  return new Error(`#dependencies: value does not have '${key}' dependency`)
                }
              }
            } else {
              if (ref.dependencies[key] === false) {
                return new Error('#dependencies: \'false\' Schema invalidates all values')
              }
              /* istanbul ignore else */
              if (ref.dependencies[key][OPTIMIZED]) {
                if (ref.dependencies[key][OPTIMIZED].length === 1) {
                  const error = ref.dependencies[key][OPTIMIZED][0](value, ref.dependencies[key])
                  if (error) return error
                } else {
                  for (let fn of ref.dependencies[key][OPTIMIZED]) {
                    const error = fn(value, ref.dependencies[key])
                    if (error) return error
                  }
                }
              }
            }
          }

          // asserts [propertyNames]
          if (ref.propertyNames || ref.propertyNames === false) {
            if (ref.propertyNames === false) {
              return new Error('#propertyNames: \'false\' Schema invalidates all values')
            }
            /* istanbul ignore else */
            if (ref.propertyNames[OPTIMIZED]) {
              if (ref.propertyNames[OPTIMIZED].length === 1) {
                const error = ref.propertyNames[OPTIMIZED][0](key, ref.propertyNames)
                if (error) return error
              } else {
                for (let fn of ref.propertyNames[OPTIMIZED]) {
                  const error = fn(key, ref.propertyNames)
                  if (error) return error
                }
              }
            }
          }
        }

        // asserts [required, maxProperties, minProperties]
        if (ref.required && reqCount !== ref.required.length) {
          return new Error('#required: value does not have all required properties')
        }
      }]
    // return validations based on defined keywords that require only object validation
    } else if (maxProperties || minProperties) {
      return [(value, ref) => {
        if (!isObject(value)) {
          if (ref.type === 'object') return new Error('#type: value is not an object')
          return
        }
        const length = Object.keys(value).length
        if (typeof ref.maxProperties === 'number' && length > ref.maxProperties) {
          return new Error('#maxProperties: value maximum exceeded')
        }
        if (typeof ref.minProperties === 'number' && length < ref.minProperties) {
          return new Error('#minProperties: value minimum not met')
        }
      }]
    // return validations based on only type keyword validation
    } else if (type === 'object') {
      return [(value, ref) => {
        if (!isObject(value)) return new Error('#type: value is not an object')
      }]
    }
    return []
  }

  static [ASSERT_DEPENDENCIES] (dependencies) {
    // determine if dependencies object contains arrays or schemas
    const keys = Object.keys(dependencies)
    for (let key of keys) {
      const value = dependencies[key]
      if (!((isArray(value) && !value.length) || isEnum(value, isString) || isSchema(value))) {
        throw new TypeError('#dependencies: all dependencies must either be Schemas|enums')
      }
    }
  }

  static [ASSERT_KEYS] (propertyNames) {
    if (!isSchema(propertyNames)) {
      throw new TypeError('#propertyNames: must be a Schema')
    }
  }

  static [ASSERT_PROPERTIES] (schema) {
    const { properties, patternProperties, additionalProperties } = schema
    const patternProps = {}

    // validate properties keyword
    if (!isUndefined(properties) && !isObject(properties)) {
      throw new TypeError('#properties: must be an Object')
    }

    // validate patternProperties keyword
    if (isObject(patternProperties)) {
      const keys = Object.keys(patternProperties)
      for (let k of keys) {
        patternProps[k] = new RegExp(k)
      }
    } else if (!isUndefined(patternProperties)) {
      throw new TypeError('#patternProperties: must be an Object')
    }

    // validate additionalProperties keyword
    if (!isUndefined(additionalProperties) && !isSchema(additionalProperties)) {
      throw new TypeError('#additionalProperties: must be either a Schema or Boolean')
    }

    return patternProps
  }

  static [ASSERT_REQUIRED] (list) {
    if (isUndefined(list)) return {}
    if (!isArray(list) || !isTypedArray(list, isString)) {
      throw new TypeError('#required: required properties must be defined in an array of strings')
    }

    return list.reduce((obj, val) => {
      obj[val] = true
      return obj
    }, {})
  }
}
