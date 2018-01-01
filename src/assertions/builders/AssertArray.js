import {
  OPTIMIZED, assertOptimized, assertSizeMax, assertSizeMin,
  isArray, isBoolean, isObject, isSchema, isUndefined
} from '../types'

// private methods
const ASSERT_CONTAINS = Symbol('validates Array contains item')
const ASSERT_ITEMS = Symbol('validates Array items')
const ASSERT_UNIQUE = Symbol('validates Array unique items')

export default class AssertArray {
  constructor () {
    return AssertArray
  }

  /*
   * array assertions
   */
  static optimize (schema) {
    const { type, contains, maxItems, minItems, uniqueItems } = schema
    const innerList = []
    const outerList = []

    // assert and optimize element-processing keywords in schema
    innerList.push(...AssertArray[ASSERT_ITEMS](schema))
    if (!isUndefined(contains)) innerList.push(AssertArray[ASSERT_CONTAINS](contains))

    // assert and optimize post-processing keywords in schema
    if (!isUndefined(maxItems)) outerList.push(assertSizeMax(maxItems, 'maxItems'))
    if (!isUndefined(minItems)) outerList.push(assertSizeMin(minItems, 'minItems'))
    if (isBoolean(uniqueItems) && uniqueItems) outerList.push(AssertArray[ASSERT_UNIQUE]())

    // return validations based on defined keywords
    if (innerList.length || outerList.length) {
      return [async (value, ref) => {
        if (!isArray(value)) {
          if (ref.type === 'array') throw new Error('#type: value is not an array')
          return
        }

        const length = value.length
        const unique = new Set()

        if (innerList.length || ref.uniqueItems === true) {
          for (let i = 0; i < length; i++) {
            if (ref.uniqueItems) {
              value[i] && typeof value[i] === 'object'
                ? unique.add(JSON.stringify(value[i]))
                : unique.add(value[i])
            }
            // asserts [items, additionalItems, contains]
            if (innerList.length) await assertOptimized([i, value], ref, innerList)
          }

          if (length === 0 && isSchema(ref.contains)) {
            throw new Error('#contains: value does not contain element matching the Schema')
          }
        }

        // asserts [uniqueItems, maxItems, minItems]
        if (outerList.length) {
          await assertOptimized({ length, uniqueCount: unique.size }, ref, outerList)
        }
      }]
    } else if (type === 'array') {
      return [async (value, ref) => {
        if (!isArray(value)) throw new Error('#type: value is not an array')
      }]
    }
    return []
  }

  static [ASSERT_CONTAINS] (contains) {
    if (!isSchema(contains)) {
      throw new TypeError('#contains: keyword should be a Schema')
    }

    let containsFlag = false
    return async ([key, val], ref) => {
      if (!containsFlag) {
        try {
          await assertOptimized(val[key], ref.contains, ref.contains[OPTIMIZED])
          containsFlag = true
        } catch (e) {
          containsFlag = false

          if (key === val.length - 1) {
            throw new Error('#contains: value does not contain element matching the Schema')
          }
        }
      } else if (key === val.length - 1) containsFlag = false
    }
  }

  static [ASSERT_ITEMS] (schema) {
    const { items, additionalItems } = schema
    const list = []

    // attach properties validations if keyword set
    if (isSchema(items)) {
      list.push(async ([key, val], ref) =>
        assertOptimized(val[key], ref.items, ref.items[OPTIMIZED]))
    } else if (isArray(items)) {
      list.push(async ([key, val], ref) =>
        assertOptimized(val[key], ref.items[key], ref.items[key][OPTIMIZED]))

      // attach additionalItems validations if keyword set
      if (isObject(additionalItems)) {
        list.push(async ([key, val], ref) =>
          assertOptimized(val[key], ref.additionalItems, ref.additionalItems[OPTIMIZED]))
      } else if (isBoolean(additionalItems) && additionalItems === false) {
        list.push(async ([key, val], ref) => {
          throw new Error(`#additionalItems: '${key}' additional items not allowed`)
        })
      } else if (!isUndefined(additionalItems)) throw new TypeError('#additionalItems: must be either a Schema or Boolean')
    } else if (!isUndefined(items)) throw new TypeError('#items: must be either a Schema or an Array of Schemas')

    if (list.length === 2) {
      return [async ([key, val], ref) => {
        if (key < ref.items.length) await list[0]([key, val], ref)
        else await list[1]([key, val], ref)
      }]
    } else if (items && isArray(items)) {
      return [async ([key, val], ref) => {
        if (key < ref.items.length) await list[0]([key, val], ref)
      }]
    }
    return list
  }

  static [ASSERT_UNIQUE] () {
    return async ({ length, uniqueCount }, ref) => {
      if (length !== uniqueCount) throw new Error('#uniqueItems: value does not contain unique items')
    }
  }
}
