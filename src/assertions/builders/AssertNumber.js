import { assertOptimized, isBoolean, isInteger, isNumber, isUndefined } from '../types'

// private methods
const ASSERT_MAX = Symbol('validates Number maximum')
const ASSERT_MAX_EXCLUDE = Symbol('validates Number exclusive maximum shorthand')
const ASSERT_MIN = Symbol('validates Number minimum')
const ASSERT_MIN_EXCLUDE = Symbol('validates Number exclusive minimum shorthand')
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
    const list = []

    const assertion = type === 'integer' ? isInteger : isNumber

    // perform remaining validations defined in schema
    if (!isUndefined(maximum)) list.push(AssertNumber[ASSERT_MAX](maximum, exclusiveMaximum, assertion))
    if (assertion(exclusiveMaximum)) list.push(AssertNumber[ASSERT_MAX_EXCLUDE]())

    if (!isUndefined(minimum)) list.push(AssertNumber[ASSERT_MIN](minimum, exclusiveMinimum, assertion))
    if (assertion(exclusiveMinimum)) list.push(AssertNumber[ASSERT_MIN_EXCLUDE]())

    if (!isUndefined(multipleOf)) list.push(AssertNumber[ASSERT_MULTIPLE](multipleOf, assertion))

    // return validations based on defined keywords
    if (list.length) {
      return [async (value, ref) => {
        if (!assertion(value)) {
          if (/^(?:integer|number)$/.test(ref.type)) throw new Error(`#type: value is not a(n) ${ref.type}`)
          return
        }
        return assertOptimized(value, ref, list)
      }]
    } else if (type && assertion.name.search(new RegExp(type, 'i')) !== -1) {
      return [async (value, ref) => {
        if (!assertion(value)) throw new Error(`#type: value is not a(n) ${ref.type}`)
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

    return exclusive
      ? async (value, ref) => {
        if (value >= ref.maximum) {
          throw new Error(`#maximum: value is greater than or equal to ${ref.maximum}`)
        }
      }
      : async (value, ref) => {
        if (value > ref.maximum) {
          throw new Error(`#maximum: value is greater than ${ref.maximum}`)
        }
      }
  }

  static [ASSERT_MAX_EXCLUDE] () {
    return async (value, ref) => {
      if (value >= ref.exclusiveMaximum) {
        throw new Error(`#exclusiveMaximum: value is greater than or equal to ${ref.exclusiveMaximum}`)
      }
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

    return exclusive
      ? async (value, ref) => {
        if (value <= ref.minimum) {
          throw new Error(`#minimum: value is less than or equal to ${ref.minimum}`)
        }
      }
      : async (value, ref) => {
        if (value < ref.minimum) {
          throw new Error(`#minimum: value is less than ${ref.minimum}`)
        }
      }
  }

  static [ASSERT_MIN_EXCLUDE] () {
    return async (value, ref) => {
      if (value <= ref.exclusiveMinimum) {
        throw new Error(`#exclusiveMinimum: value is less than or equal to ${ref.exclusiveMinimum}`)
      }
    }
  }

  static [ASSERT_MULTIPLE] (multipleOf, assertion) {
    if (!assertion(multipleOf)) {
      throw new TypeError('#multipleOf: keyword is not the right type')
    }
    return async (value, ref) => {
      if ((value / ref.multipleOf) % 1 !== 0) {
        throw new Error(`#multipleOf: value is not a multiple of ${ref.multipleOf}`)
      }
    }
  }
}
