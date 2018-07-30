import { isInteger } from './primitive'

/*
 * optimized assertions
 */
export const OPTIMIZED = Symbol('list of validation thunks')

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
