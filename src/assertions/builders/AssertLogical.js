import { OPTIMIZED, assertOptimized, isArray, isSchema, isTypedArray, isUndefined } from '../types'

export default class AssertLogical {
  constructor () {
    return AssertLogical
  }

  /*
   * logical operation keyword assertions
   */
  static optimizeAllOf (schema) {
    const { allOf } = schema
    if (isUndefined(allOf)) return []

    if (!isArray(allOf) || !isTypedArray(allOf, isSchema)) {
      throw new TypeError('#allOf: keyword should be an array of Schemas')
    }

    return [async (value, ref, errors) => {
      for (let refSchema of ref.allOf) {
        await assertOptimized(value, refSchema, refSchema[OPTIMIZED], errors)
      }
    }]
  }

  static optimizeAnyOf (schema) {
    const { anyOf } = schema
    if (isUndefined(anyOf)) return []

    if (!isArray(anyOf) || !isTypedArray(anyOf, isSchema)) {
      throw new TypeError('#anyOf: keyword should be an array of Schemas')
    }

    return [async (value, ref, errors) => {
      const outerErr = []
      for (let refSchema of ref.anyOf) {
        let innerErr = []
        await assertOptimized(value, refSchema, refSchema[OPTIMIZED], innerErr)
        if (!innerErr.length) return
        outerErr.push(...innerErr)
      }
      errors.push(...outerErr)
    }]
  }

  static optimizeNot (schema) {
    const { not } = schema
    if (isUndefined(not)) return []

    if (!isSchema(not)) {
      throw new TypeError('#not: keyword should be a Schema')
    }

    return [async (value, ref, errors) => {
      const err = []
      await assertOptimized(value, ref.not, ref.not[OPTIMIZED], err)
      if (!err.length) errors.push('#not: value validated successfully against the schema')
    }]
  }

  static optimizeOneOf (schema) {
    const { oneOf } = schema
    if (isUndefined(oneOf)) return []

    if (!isArray(oneOf) || !isTypedArray(oneOf, isSchema)) {
      throw new TypeError('#oneOf: keyword should be an array of Schemas')
    }

    return [async (value, ref, errors) => {
      let count = 0
      for (let refSchema of ref.oneOf) {
        let innerErr = []
        await assertOptimized(value, refSchema, refSchema[OPTIMIZED], innerErr)
        if (innerErr.length) count++
      }
      if (count !== ref.oneOf.length - 1) {
        errors.push('#oneOf: value should be one of the listed schemas only')
      }
    }]
  }
}
