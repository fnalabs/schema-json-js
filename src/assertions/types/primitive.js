/*
 * primitive type assertions
 */
export function isArray (value) {
  return Array.isArray(value)
}

export function isBoolean (value) {
  return typeof value === 'boolean'
}

export function isFunction (value) {
  return typeof value === 'function'
}

export function isInteger (value) {
  return Number.isInteger(value)
}

export function isNull (value) {
  return value === null
}

export function isNumber (value) {
  return typeof value === 'number'
}

export function isObject (value) {
  return (value && typeof value === 'object' && !Array.isArray(value))
}

export function isString (value) {
  return typeof value === 'string'
}

export function isUndefined (value) {
  return typeof value === 'undefined'
}
