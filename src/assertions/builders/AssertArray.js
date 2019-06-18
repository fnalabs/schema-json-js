import {
  OPTIMIZED, assertSizeMax, assertSizeMin,
  isArray, isBoolean, isObject, isSchema, isUndefined
} from '../types'

// private methods
const ASSERT_CONTAINS = Symbol('validates array contains item')
const ASSERT_ITEMS = Symbol('validates array items')

export default class AssertArray {
  constructor () {
    return AssertArray
  }

  /*
   * array assertions
   */
  static optimize (schema) {
    const { type, items, additionalItems, contains, maxItems, minItems, uniqueItems } = schema

    // assert and optimize element-processing keywords in schema
    if (!isUndefined(items)) AssertArray[ASSERT_ITEMS](schema)
    if (!isUndefined(contains)) AssertArray[ASSERT_CONTAINS](contains)

    // assert and optimize post-processing keywords in schema
    if (!isUndefined(maxItems)) assertSizeMax(maxItems, 'maxItems')
    if (!isUndefined(minItems)) assertSizeMin(minItems, 'minItems')

    // return validations based on defined keywords that require iterative validation
    if (items || items === false || additionalItems || contains || contains === false || uniqueItems) {
      return [(value, ref) => {
        if (!isArray(value)) {
          if (ref.type === 'array') return '#type: value is not an array'
          return
        }

        let containsFlag = false
        let length = value.length
        let unique = new Set()
        let error

        // asserts [maxItems, minItems]
        if (typeof ref.maxItems === 'number' && length > ref.maxItems) {
          return '#maxItems: value maximum exceeded'
        }
        if (typeof ref.minItems === 'number' && length < ref.minItems) {
          return '#minItems: value minimum not met'
        }

        for (let index = 0; index < length; index++) {
          if (ref.uniqueItems) {
            value[index] && typeof value[index] === 'object'
              ? unique.add(JSON.stringify(value[index]))
              : unique.add(value[index])
          }

          // asserts [items, additionalItems]
          if (ref.items || ref.items === false) {
            if (isArray(ref.items)) {
              if (index < ref.items.length) {
                if (ref.items[index] === false) {
                  return '#items: \'false\' JSON Schema invalidates all values'
                } else if (ref.items[index][OPTIMIZED]) {
                  error = ref.items[index][OPTIMIZED](value[index], ref.items[index])
                  if (error) return error
                }
              } else if (ref.additionalItems || ref.additionalItems === false) {
                if (ref.additionalItems === false) {
                  return `#additionalItems: '${index}' additional items not allowed`
                } else if (ref.additionalItems[OPTIMIZED]) {
                  error = ref.additionalItems[OPTIMIZED](value[index], ref.additionalItems)
                  if (error) return error
                }
              }
            } else if (ref.items === false) {
              return '#items: \'false\' JSON Schema invalidates all values'
            } else if (ref.items[OPTIMIZED]) {
              error = ref.items[OPTIMIZED](value[index], ref.items)
              if (error) return error
            }
          }

          // asserts [contains]
          if (ref.contains || ref.contains === false) {
            if (!containsFlag) {
              if (ref.contains === false) {
                error = '#contains: \'false\' JSON Schema invalidates all values'
              } else if (ref.contains[OPTIMIZED]) {
                error = ref.contains[OPTIMIZED](value[index], ref.contains)
              }

              if (error) {
                containsFlag = false
                if (index === length - 1) {
                  return '#contains: value does not contain element matching the schema'
                }
              } else containsFlag = true
            } else if (index === length - 1) containsFlag = false
          }
        }

        // handling empty array edge case if `contains` keyword is defined
        if (length === 0 && (ref.contains || ref.contains === false)) {
          return '#contains: value does not contain element matching the schema'
        }

        // asserts [uniqueItems, maxItems, minItems]
        if (ref.uniqueItems && length !== unique.size) {
          return '#uniqueItems: value does not contain unique items'
        }
      }]
    // return validations based on defined keywords that require only array validation
    } else if (maxItems || minItems) {
      return [(value, ref) => {
        if (!isArray(value)) {
          if (ref.type === 'array') return '#type: value is not an array'
          return
        }
        if (typeof ref.maxItems === 'number' && value.length > ref.maxItems) {
          return '#maxItems: value maximum exceeded'
        }
        if (typeof ref.minItems === 'number' && value.length < ref.minItems) {
          return '#minItems: value minimum not met'
        }
      }]
    // return validations based on only type keyword validation
    } else if (type === 'array') {
      return [(value, ref) => {
        if (!isArray(value)) return '#type: value is not an array'
      }]
    }
    return []
  }

  static [ASSERT_CONTAINS] (contains) {
    if (!isSchema(contains)) {
      throw new TypeError('#contains: keyword should be a JSON Schema')
    }
  }

  static [ASSERT_ITEMS] (schema) {
    const { items, additionalItems } = schema

    // validate properties validations if keyword set
    if (isArray(items)) {
      // validate additionalItems validations if keyword set
      if (!isUndefined(additionalItems) && !isBoolean(additionalItems) && !isObject(additionalItems)) {
        throw new TypeError('#additionalItems: must be either a JSON Schema or boolean if defined')
      }
    } else if (!isSchema(items)) {
      throw new TypeError('#items: must be either a JSON Schema or an array of JSON Schemas')
    }
  }
}
