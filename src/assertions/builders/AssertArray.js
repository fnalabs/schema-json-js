import {
  OPTIMIZED, assertOptimized, assertSizeMax, assertSizeMin,
  isArray, isBoolean, isObject, isSchema, isUndefined
} from '../types'

// private methods
const ASSERT_CONTAINS = Symbol('validates Array contains item')
const ASSERT_ITEMS = Symbol('validates Array items')

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
          if (ref.type === 'array') return new Error('#type: value is not an array')
          return
        }

        const length = value.length
        const unique = new Set()
        let containsFlag = false

        // asserts [maxItems, minItems]
        if (typeof ref.maxItems === 'number' && length > ref.maxItems) {
          return new Error('#maxItems: value maximum exceeded')
        }
        if (typeof ref.minItems === 'number' && length < ref.minItems) {
          return new Error('#minItems: value minimum not met')
        }

        for (let i = 0; i < length; i++) {
          if (ref.uniqueItems) {
            value[i] && typeof value[i] === 'object'
              ? unique.add(JSON.stringify(value[i]))
              : unique.add(value[i])
          }

          // asserts [items, additionalItems]
          if (ref.items || ref.items === false) {
            if (Array.isArray(ref.items)) {
              if (i < ref.items.length) {
                const error = assertOptimized(value[i], ref.items[i], ref.items[i][OPTIMIZED])
                if (error) return error
              } else if (ref.additionalItems || ref.additionalItems === false) {
                if (typeof ref.additionalItems === 'boolean' && ref.additionalItems === false) {
                  return new Error(`#additionalItems: '${i}' additional items not allowed`)
                } else {
                  const error = assertOptimized(value[i], ref.additionalItems, ref.additionalItems[OPTIMIZED])
                  if (error) return error
                }
              }
            } else {
              const error = assertOptimized(value[i], ref.items, ref.items[OPTIMIZED])
              if (error) return error
            }
          }

          // asserts [contains]
          if (ref.contains || ref.contains === false) {
            if (!containsFlag) {
              const error = assertOptimized(value[i], ref.contains, ref.contains[OPTIMIZED])
              if (error) {
                containsFlag = false

                if (i === length - 1) {
                  return new Error('#contains: value does not contain element matching the Schema')
                }
              } else containsFlag = true
            } else if (i === length - 1) containsFlag = false
          }
        }

        // handling empty array edge case if `contains` keyword is defined
        if (length === 0 && (ref.contains || ref.contains === false)) {
          return new Error('#contains: value does not contain element matching the Schema')
        }

        // asserts [uniqueItems, maxItems, minItems]
        if (ref.uniqueItems && length !== unique.size) {
          return new Error('#uniqueItems: value does not contain unique items')
        }
      }]
    // return validations based on defined keywords that require only array validation
    } else if (maxItems || minItems) {
      return [(value, ref) => {
        if (!isArray(value)) {
          if (ref.type === 'array') return new Error('#type: value is not an array')
          return
        }
        if (typeof ref.maxItems === 'number' && value.length > ref.maxItems) {
          return new Error('#maxItems: value maximum exceeded')
        }
        if (typeof ref.minItems === 'number' && value.length < ref.minItems) {
          return new Error('#minItems: value minimum not met')
        }
      }]
    // return validations based on only type keyword validation
    } else if (type === 'array') {
      return [(value, ref) => {
        if (!isArray(value)) return new Error('#type: value is not an array')
      }]
    }
    return []
  }

  static [ASSERT_CONTAINS] (contains) {
    if (!isSchema(contains)) {
      throw new TypeError('#contains: keyword should be a Schema')
    }
  }

  static [ASSERT_ITEMS] (schema) {
    const { items, additionalItems } = schema

    // validate properties validations if keyword set
    if (isArray(items)) {
      // validate additionalItems validations if keyword set
      if (!isUndefined(additionalItems) && !isBoolean(additionalItems) && !isObject(additionalItems)) {
        throw new TypeError('#additionalItems: must be either a Schema or Boolean if defined')
      }
    } else if (!isSchema(items)) {
      throw new TypeError('#items: must be either a Schema or an Array of Schemas')
    }
  }
}
