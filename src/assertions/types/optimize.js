import { isInteger } from './primitive'

/*
 * optimized assertions
 */
export const OPTIMIZED = Symbol('list of validation thunks')
export function assertOptimized (value, schema, optimized = []) {
  if (schema === false) return new Error('\'false\' Schema invalidates all values')
  for (let fn of optimized) {
    const error = fn(value, schema)
    if (error) return error
  }
}

export function assertSizeMax (size, key) {
  if (!(isInteger(size) && size >= 0)) {
    throw new TypeError(`#${key}: keyword must be a positive integer`)
  }
}

export function assertSizeMin (size, key) {
  if (!(isInteger(size) && size >= 0)) {
    throw new TypeError(`#${key}: keyword must be a positive integer`)
  }
}
