import { isBoolean, isInteger, isNumber, isUndefined } from '../types'

const isNumberTypeRegex = /^(?:integer|number)$/

// private methods
const ASSERT_MAX = Symbol('validates Number maximum')
const ASSERT_MIN = Symbol('validates Number minimum')
const ASSERT_MULTIPLE = Symbol('validates Number multipleOf')

export default class AssertNumber {
  constructor () {
    return AssertNumber
  }

  /*
   * number assertions
   */
  static optimize (schema) {
    const { type, exclusiveMaximum, exclusiveMinimum, maximum, minimum, multipleOf } = schema

    const assertion = type === 'integer' ? isInteger : isNumber

    // perform remaining validations defined in schema
    if (!isUndefined(maximum)) AssertNumber[ASSERT_MAX](maximum, exclusiveMaximum, assertion)
    if (!isUndefined(minimum)) AssertNumber[ASSERT_MIN](minimum, exclusiveMinimum, assertion)
    if (!isUndefined(multipleOf)) AssertNumber[ASSERT_MULTIPLE](multipleOf, assertion)

    // return validations based on defined keywords
    if (isNumber(maximum) || isNumber(exclusiveMaximum) || isNumber(minimum) || isNumber(exclusiveMinimum) || isNumber(multipleOf)) {
      return [(value, ref) => {
        if (!assertion(value)) {
          if (isNumberTypeRegex.test(ref.type)) return `#type: value is not a(n) ${ref.type}`
          return
        }
        if (typeof ref.maximum === 'number' && ((ref.exclusiveMaximum && value >= ref.maximum) || value > ref.maximum)) {
          return `#maximum: ${value} is greater than or equal to ${ref.maximum}`
        }
        if (typeof ref.exclusiveMaximum === 'number' && value >= ref.exclusiveMaximum) {
          return `#exclusiveMaximum: ${value} is greater than or equal to ${ref.exclusiveMaximum}`
        }
        if (typeof ref.minimum === 'number' && ((ref.exclusiveMinimum && value <= ref.minimum) || value < ref.minimum)) {
          return `#minimum: ${value} is less than or equal to ${ref.minimum}`
        }
        if (typeof ref.exclusiveMinimum === 'number' && value <= ref.exclusiveMinimum) {
          return `#exclusiveMinimum: ${value} is less than or equal to ${ref.exclusiveMinimum}`
        }
        if (typeof ref.multipleOf === 'number' && (value / ref.multipleOf) % 1 !== 0) {
          return `#multipleOf: ${value} is not a multiple of ${ref.multipleOf}`
        }
      }]
    } else if (type && assertion.name.search(new RegExp(type, 'i')) !== -1) {
      return [(value, ref) => {
        if (!assertion(value)) return `#type: value is not a(n) ${ref.type}`
      }]
    }
    return []
  }

  static [ASSERT_MAX] (maximum, exclusive = false, assertion) {
    if (isNumber(exclusive)) exclusive = false

    if (!assertion(maximum)) {
      throw new TypeError('#maximum: keyword is not the right type')
    }
    if (!isBoolean(exclusive)) {
      throw new TypeError('#exclusiveMaximum: keyword is not a boolean')
    }
  }

  static [ASSERT_MIN] (minimum, exclusive = false, assertion) {
    if (isNumber(exclusive)) exclusive = false

    if (!assertion(minimum)) {
      throw new TypeError('#minimum: keyword is not the right type')
    }
    if (!isBoolean(exclusive)) {
      throw new TypeError('#exclusiveMinimum: keyword is not a boolean')
    }
  }

  static [ASSERT_MULTIPLE] (multipleOf, assertion) {
    if (!assertion(multipleOf)) {
      throw new TypeError('#multipleOf: keyword is not the right type')
    }
  }
}
