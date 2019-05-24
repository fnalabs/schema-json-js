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
      for (let index = 0, length = ref.allOf.length; index < length; index++) {
        if (ref.allOf[index] === false) {
          return new Error('#allOf: \'false\' Schema invalidates all values')
        }
        /* istanbul ignore else */
        if (ref.allOf[index][OPTIMIZED]) {
          if (ref.allOf[index][OPTIMIZED].length === 1) {
            const error = ref.allOf[index][OPTIMIZED][0](value, ref.allOf[index])
            if (error) return error
          } else {
            let i = ref.allOf[index][OPTIMIZED].length
            while (i--) {
              const error = ref.allOf[index][OPTIMIZED][i](value, ref.allOf[index])
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
      for (let index = 0, length = ref.anyOf.length; index < length; index++) {
        if (ref.anyOf[index] === true) return
        /* istanbul ignore else */
        if (ref.anyOf[index][OPTIMIZED]) {
          if (ref.anyOf[index][OPTIMIZED].length === 1) {
            const error = ref.anyOf[index][OPTIMIZED][0](value, ref.anyOf[index])
            if (!error) return
          } else {
            let error
            let i = ref.anyOf[index][OPTIMIZED].length
            while (i--) {
              error = ref.anyOf[index][OPTIMIZED][i](value, ref.anyOf[index])
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
          let index = ref.not[OPTIMIZED].length
          while (index--) {
            const error = ref.not[OPTIMIZED][index](value, ref.not)
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
      for (let index = 0, length = ref.oneOf.length; index < length; index++) {
        if (ref.oneOf[index] === true) count++
        if (ref.oneOf[index][OPTIMIZED]) {
          if (ref.oneOf[index][OPTIMIZED].length === 1) {
            const error = ref.oneOf[index][OPTIMIZED][0](value, ref.oneOf[index])
            if (!error) count++
          } else {
            let error
            let i = ref.oneOf[index][OPTIMIZED].length
            while (i--) {
              error = ref.oneOf[index][OPTIMIZED][i](value, ref.oneOf[index])
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
