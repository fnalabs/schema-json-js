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

    return [async (value, ref) => {
      for (let refSchema of ref.allOf) {
        await assertOptimized(value, refSchema, refSchema[OPTIMIZED])
      }
    }]
  }

  static optimizeAnyOf (schema) {
    const { anyOf } = schema
    if (isUndefined(anyOf)) return []

    if (!isArray(anyOf) || !isTypedArray(anyOf, isSchema)) {
      throw new TypeError('#anyOf: keyword should be an array of Schemas')
    }

    return [async (value, ref) => {
      for (let refSchema of ref.anyOf) {
        try {
          await assertOptimized(value, refSchema, refSchema[OPTIMIZED])
          return
        } catch (e) {}
      }
      throw new Error('#anyOf: none of the defined Schemas match the value')
    }]
  }

  static optimizeNot (schema) {
    const { not } = schema
    if (isUndefined(not)) return []

    if (!isSchema(not)) {
      throw new TypeError('#not: keyword should be a Schema')
    }

    return [async (value, ref) => {
      try {
        await assertOptimized(value, ref.not, ref.not[OPTIMIZED])
      } catch (e) { return }

      throw new Error('#not: value validated successfully against the schema')
    }]
  }

  static optimizeOneOf (schema) {
    const { oneOf } = schema
    if (isUndefined(oneOf)) return []

    if (!isArray(oneOf) || !isTypedArray(oneOf, isSchema)) {
      throw new TypeError('#oneOf: keyword should be an array of Schemas')
    }

    return [async (value, ref) => {
      let count = 0
      for (let refSchema of ref.oneOf) {
        try {
          await assertOptimized(value, refSchema, refSchema[OPTIMIZED])
          count++
        } catch (e) {}
      }
      if (count !== 1) throw new Error('#oneOf: value should be one of the listed schemas only')
    }]
  }
}
