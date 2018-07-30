import { OPTIMIZED, isArray, isSchema, isTypedArray, isUndefined } from '../types'

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

    return [(value, ref) => {
      for (let refSchema of ref.allOf) {
        if (refSchema === false) {
          return new Error('#allOf: \'false\' Schema invalidates all values')
        }
        /* istanbul ignore else */
        if (refSchema[OPTIMIZED]) {
          if (refSchema[OPTIMIZED].length === 1) {
            const error = refSchema[OPTIMIZED][0](value, refSchema)
            if (error) return error
          } else {
            for (let fn of refSchema[OPTIMIZED]) {
              const error = fn(value, refSchema)
              if (error) return error
            }
          }
        }
      }
    }]
  }

  static optimizeAnyOf (schema) {
    const { anyOf } = schema
    if (isUndefined(anyOf)) return []

    if (!isArray(anyOf) || !isTypedArray(anyOf, isSchema)) {
      throw new TypeError('#anyOf: keyword should be an array of Schemas')
    }

    return [(value, ref) => {
      for (let refSchema of ref.anyOf) {
        if (refSchema === true) return
        /* istanbul ignore else */
        if (refSchema[OPTIMIZED]) {
          if (refSchema[OPTIMIZED].length === 1) {
            const error = refSchema[OPTIMIZED][0](value, refSchema)
            if (!error) return
          } else {
            let error
            for (let fn of refSchema[OPTIMIZED]) {
              error = fn(value, refSchema)
              if (error) break
            }
            if (!error) return
          }
        }
      }
      return new Error('#anyOf: none of the defined Schemas match the value')
    }]
  }

  static optimizeNot (schema) {
    const { not } = schema
    if (isUndefined(not)) return []

    if (!isSchema(not)) {
      throw new TypeError('#not: keyword should be a Schema')
    }

    return [(value, ref) => {
      if (ref.not === false) return
      /* istanbul ignore else */
      if (ref.not[OPTIMIZED]) {
        if (ref.not[OPTIMIZED].length === 1) {
          const error = ref.not[OPTIMIZED][0](value, ref.not)
          if (error) return
        } else {
          for (let fn of ref.not[OPTIMIZED]) {
            const error = fn(value, ref.not)
            if (error) return
          }
        }
      }
      return new Error('#not: value validated successfully against the schema')
    }]
  }

  static optimizeOneOf (schema) {
    const { oneOf } = schema
    if (isUndefined(oneOf)) return []

    if (!isArray(oneOf) || !isTypedArray(oneOf, isSchema)) {
      throw new TypeError('#oneOf: keyword should be an array of Schemas')
    }

    return [(value, ref) => {
      let count = 0
      for (let refSchema of ref.oneOf) {
        if (refSchema === true) count++
        if (refSchema[OPTIMIZED]) {
          if (refSchema[OPTIMIZED].length === 1) {
            const error = refSchema[OPTIMIZED][0](value, refSchema)
            if (!error) count++
          } else {
            let error
            for (let fn of refSchema[OPTIMIZED]) {
              error = fn(value, refSchema)
              if (error) break
            }
            if (!error) count++
          }
        }
        if (count > 1) return new Error('#oneOf: value should be one of the listed schemas only')
      }
      if (count !== 1) return new Error('#oneOf: value should be one of the listed schemas only')
    }]
  }
}
