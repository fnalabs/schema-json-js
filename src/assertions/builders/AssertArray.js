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
      return [async (value, ref, errors) => {
        if (!isArray(value)) {
          if (ref.type === 'array') errors.push('#type: value is not an array')
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
            if (innerList.length) await assertOptimized([i, value], ref, innerList, errors)
          }
        }

        // asserts [uniqueItems, maxItems, minItems]
        if (outerList.length) {
          await assertOptimized({ length, uniqueCount: unique.size }, ref, outerList, errors)
        }
      }]
    } else if (type === 'array') {
      return [async (value, ref, errors) =>
        !isArray(value) && errors.push('#type: value is not an array')]
    }
    return []
  }

  static [ASSERT_CONTAINS] (contains) {
    if (!isSchema(contains)) {
      throw new TypeError('#contains: keyword should be a Schema')
    }

    let containsFlag = false
    return async ([key, val], ref, errors) => {
      if (!containsFlag) {
        const err = []
        await assertOptimized([key, val], ref.contains, ref.contains[OPTIMIZED], err)

        if (!err.length) containsFlag = true
        if (key === val.length - 1) {
          errors.push(`#contains: '${key}' does not contain a valid value`)
          containsFlag = false
        }
      }
    }
  }

  static [ASSERT_ITEMS] (schema) {
    const { items, additionalItems } = schema
    const list = []

    // attach properties validations if keyword set
    if (isSchema(items)) {
      list.push(async ([key, val], ref, errors) =>
        assertOptimized(val[key], ref.items, ref.items[OPTIMIZED], errors))
    } else if (isArray(items)) {
      list.push(async ([key, val], ref, errors) =>
        assertOptimized(val[key], ref.items[key], ref.items[key][OPTIMIZED], errors))

      // attach additionalItems validations if keyword set
      if (isObject(additionalItems)) {
        list.push(async ([key, val], ref, errors) =>
          assertOptimized(val[key], ref.additionalItems, ref.additionalItems[OPTIMIZED], errors))
      } else if (isBoolean(additionalItems) && additionalItems === false) {
        list.push(async ([key, val], ref, errors) =>
          errors.push(`#additionalItems: '${key}' additional items not allowed`))
      } else if (!isUndefined(additionalItems)) throw new TypeError('#additionalItems: must be either a Schema or Boolean')
    } else if (!isUndefined(items)) throw new TypeError('#items: must be either a Schema or an Array of Schemas')

    if (list.length === 2) {
      return [async ([key, val], ref, errors) => {
        if (key < ref.items.length) await list[0]([key, val], ref, errors)
        else await list[1]([key, val], ref, errors)
      }]
    } else if (items && isArray(items)) {
      return [async ([key, val], ref, errors) => {
        if (key < ref.items.length) await list[0]([key, val], ref, errors)
      }]
    }
    return list
  }

  static [ASSERT_UNIQUE] () {
    return async ({ length, uniqueCount }, ref, errors) =>
      length !== uniqueCount &&
        errors.push('#uniqueItems: value does not contain unique items')
  }
}
