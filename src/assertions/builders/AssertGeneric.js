import { deepEqual, isEnum, isUndefined } from '../types'

// private methods
const ASSERT_CONST = Symbol('validates constants')
const ASSERT_ENUM = Symbol('validates values against an enum')

export default class AssertGeneric {
  constructor () {
    return AssertGeneric
  }

  /*
   * generic keyword assertions
   */
  static optimize (schema) {
    const list = []

    if (!isUndefined(schema.const)) list.push(AssertGeneric[ASSERT_CONST](schema))
    if (!isUndefined(schema.enum)) list.push(AssertGeneric[ASSERT_ENUM](schema))

    return list
  }

  static [ASSERT_CONST] (schema) {
    return (value, ref) => {
      if (ref.const && typeof ref.const === 'object' && deepEqual(value, ref.const)) return
      else if (value === ref.const) return

      return '#const: value does not match the defined const'
    }
  }

  static [ASSERT_ENUM] (schema) {
    if (!isEnum(schema.enum)) {
      throw new TypeError('#enum: invalid enum, check format and for duplicates')
    }

    return (value, ref) => {
      let index = ref.enum.length
      while (index--) {
        if (!(value && typeof value === 'object') && value === ref.enum[index]) return
        else if (ref.enum[index] && typeof ref.enum[index] === 'object' && deepEqual(value, ref.enum[index])) return
      }
      return '#enum: value does not match anything in the enum'
    }
  }
}
