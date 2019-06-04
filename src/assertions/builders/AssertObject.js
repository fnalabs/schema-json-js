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
        let index = keys.length
        let reqCount = 0
        let patternMatch = false
        let propertiesMatch = false

        // asserts [required, maxProperties, minProperties]
        if (typeof ref.maxProperties === 'number' && index > ref.maxProperties) {
          return new Error('#maxProperties: value maximum exceeded')
        }
        if (typeof ref.minProperties === 'number' && index < ref.minProperties) {
          return new Error('#minProperties: value minimum not met')
        }

        // loop runs assertions for [properties, patternProperties, additionalProperties, etc.]
        while (index--) {
          const val = value[keys[index]]
          // check for required
          if (req[keys[index]]) reqCount++

          // asserts [properties]
          propertiesMatch = false
          if (ref.properties && (ref.properties[keys[index]] || ref.properties[keys[index]] === false)) {
            propertiesMatch = true
            if (ref.properties[keys[index]] === false) {
              return new Error('#properties: \'false\' Schema invalidates all values')
            }
            if (ref.properties[keys[index]][OPTIMIZED]) {
              const error = ref.properties[keys[index]][OPTIMIZED](val, ref.properties[keys[index]])
              if (error) return error
            }
          }

          // asserts [patternProperties]
          if (ref.patternProperties) {
            patternMatch = false
            const propKeys = Object.keys(ref.patternProperties)
            let i = propKeys.length
            while (i--) {
              if (patternProps[propKeys[i]].test(keys[index])) {
                patternMatch = true
                if (ref.patternProperties[propKeys[i]] === false) {
                  return new Error('#patternProperties: \'false\' Schema invalidates all values')
                }
                /* istanbul ignore else */
                if (ref.patternProperties[propKeys[i]][OPTIMIZED]) {
                  const error =
                    ref.patternProperties[propKeys[i]][OPTIMIZED](val, ref.patternProperties[propKeys[i]])
                  if (error) return error
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
              const error = ref.additionalProperties[OPTIMIZED](val, ref.additionalProperties)
              if (error) return error
            }
          }

          // asserts [dependencies]
          if (ref.dependencies && (ref.dependencies[keys[index]] || ref.dependencies[keys[index]] === false)) {
            if (Array.isArray(ref.dependencies[keys[index]])) {
              let i = ref.dependencies[keys[index]].length
              while (i--) {
                if (typeof value[ref.dependencies[keys[index]][i]] === 'undefined') {
                  return new Error(`#dependencies: value does not have '${keys[index]}' dependency`)
                }
              }
            } else {
              if (ref.dependencies[keys[index]] === false) {
                return new Error('#dependencies: \'false\' Schema invalidates all values')
              }
              /* istanbul ignore else */
              if (ref.dependencies[keys[index]][OPTIMIZED]) {
                const error =
                  ref.dependencies[keys[index]][OPTIMIZED](value, ref.dependencies[keys[index]])
                if (error) return error
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
              const error = ref.propertyNames[OPTIMIZED](keys[index], ref.propertyNames)
              if (error) return error
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
    let index = keys.length
    while (index--) {
      const value = dependencies[keys[index]]
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
      let index = keys.length
      while (index--) {
        patternProps[keys[index]] = new RegExp(keys[index])
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
