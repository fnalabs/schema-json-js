export class AssertBoolean {
  constructor () {
    return AssertBoolean
  }

  static optimize (schema) {
    if (schema.type !== 'boolean') return []

    return [(value, ref) => {
      if (typeof value !== 'boolean') return `#type: ${typeof value} is not a boolean`
    }]
  }
}

export class AssertNull {
  constructor () {
    return AssertNull
  }

  static optimize (schema) {
    if (schema.type !== 'null') return []

    return [(value, ref) => {
      if (value !== null) return `#type: ${typeof value} is not null`
    }]
  }
}

export { default as AssertArray } from './AssertArray'
export { default as AssertGeneric } from './AssertGeneric'
export { default as AssertLogical } from './AssertLogical'
export { default as AssertNumber } from './AssertNumber'
export { default as AssertObject } from './AssertObject'
export { default as AssertString } from './AssertString'
