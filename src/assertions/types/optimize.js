import { isInteger } from './primitive'

/*
 * optimized assertions
 */
export const OPTIMIZED = Symbol('cache of thunked methods to validate a value')
export async function assertOptimized (value, schema, optimized, errors) {
  return Promise.all(optimized.map(fn => fn(value, schema, errors)))
}

export function assertSizeMax (size, key) {
  if (!(isInteger(size) && size > 0)) {
    throw new TypeError(`#${key}: keyword must be a positive integer`)
  }
  return async (results, ref, errors) =>
    results.length > ref[key] && errors.push(`#${key}: value maximum exceeded`)
}

export function assertSizeMin (size, key) {
  if (!(isInteger(size) && size > 0)) {
    throw new TypeError(`#${key}: keyword must be a positive integer`)
  }
  return async (results, ref, errors) =>
    results.length < ref[key] && errors.push(`#${key}: value minimum not met`)
}
