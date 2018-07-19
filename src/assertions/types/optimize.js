import { isInteger } from './primitive'

/*
 * optimized assertions
 */
export const OPTIMIZED = Symbol('cache of thunked methods to validate a value')
export function assertOptimized (value, schema, optimized = []) {
  if (schema === false) return new Error('\'false\' Schema invalidates all values')
  for (let fn of optimized) {
    const error = fn(value, schema)
    if (error) return error
  }
}

export function assertSizeMax (size, key) {
  if (!(isInteger(size) && size > 0)) {
    throw new TypeError(`#${key}: keyword must be a positive integer`)
  }
  return (results, ref) => {
    if (results.length > ref[key]) return new Error(`#${key}: value maximum exceeded`)
  }
}

export function assertSizeMin (size, key) {
  if (!(isInteger(size) && size > 0)) {
    throw new TypeError(`#${key}: keyword must be a positive integer`)
  }
  return (results, ref) => {
    if (results.length < ref[key]) return new Error(`#${key}: value minimum not met`)
  }
}
