import { isArray, isBoolean, isObject } from './primitive'

const isGenericKeyRegex = /^(?:const|enum)$/
const isObjKeyRegex = /^(?:properties|patternProperties|dependencies|definitions)$/
const isSchemaTypeRegex = /^(?:array|boolean|integer|null|number|object|string)$/
const isUrlRegex = /^(?:((?:(http|https):\/\/)(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(?:\.(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*(?::\d+)?\/)?((?:~(?=[01])|[^~])*)|#(?:~(?=[01])|[^~])*)$/

/*
 * complex type assertions
 */
export function deepEqual (value, control) {
  if (isArray(control)) {
    if (!isArray(value)) return false
    if (value.length !== control.length) return false

    let i = control.length
    while (i--) {
      if (!deepEqual(value[i], control[i])) return false
    }
  } else if (control && typeof control === 'object') {
    if (!isObject(value)) return false

    const keys = Object.keys(control)
    if (keys.length !== Object.keys(value).length) return false

    let i = keys.length
    while (i--) {
      if (!deepEqual(value[keys[i]], control[keys[i]])) return false
    }
  } else if (value !== control) return false

  return true
}

export function isEnum (value, assertion) {
  if (!isArray(value) || !value.length) return false

  const enumSet = new Set()
  let index = value.length
  while (index--) {
    value[index] && typeof value[index] === 'object'
      ? enumSet.add(JSON.stringify(value[index]))
      : enumSet.add(value[index])
  }
  if (value.length !== enumSet.size) return false

  if (assertion) {
    let i = value.length
    while (i--) {
      if (!assertion(value[i])) return false
    }
  }
  return true
}

export function isParentKeyword (parents) {
  const len = parents.length

  let check = false
  if (isObjKeyRegex.test(parents[len - 1])) check = true
  if (parents[len - 2] === 'properties') check = false

  let index = parents.length
  while (index--) {
    if (isGenericKeyRegex.test(parents[index])) check = true
  }
  return check
}

export function isPathFragment ($ref) {
  return $ref[$ref.length - 1] === '/'
}

export function isRef (ref) {
  return isUrlRegex.exec(decodeURI(ref))
}

export function isSchema (schema) {
  return isObject(schema) || isBoolean(schema)
}

export function isSchemaType (type) {
  return isSchemaTypeRegex.test(type)
}

export function isSubSchema ($id, path) {
  const match = isRef($id)
  return isArray(match) && match[1] && match[2] && path[path.length - 2] === 'definitions'
}

export function isTypedArray (value, assertion) {
  let index = value.length
  while (index--) if (!assertion(value[index])) return false
  return true
}
