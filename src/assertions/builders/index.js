import { isBoolean } from '../types'

export class AssertBoolean {
  constructor () {
    return AssertBoolean
  }

  static optimize (schema) {
    if (schema.type !== 'boolean') return []

    return [async (value, ref, errors) =>
      !isBoolean(value) && errors.push('#type: value is not a boolean')]
  }
}

export class AssertNull {
  constructor () {
    return AssertNull
  }

  static optimize (schema) {
    if (schema.type !== 'null') return []

    return [async (value, ref, errors) =>
      value !== null && errors.push('#type: value is not null')]
  }
}

export { default as AssertArray } from './AssertArray'
export { default as AssertGeneric } from './AssertGeneric'
export { default as AssertLogical } from './AssertLogical'
export { default as AssertNumber } from './AssertNumber'
export { default as AssertObject } from './AssertObject'
export { default as AssertString } from './AssertString'
