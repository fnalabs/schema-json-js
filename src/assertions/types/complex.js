import { isArray, isBoolean, isObject } from './primitive'

/*
 * complex type assertions
 */
export function deepEqual (value, control) {
  if (isArray(control)) {
    if (!isArray(value)) return false
    if (value.length !== control.length) return false
    for (let i = 0; i < control.length; i++) {
      if (!deepEqual(value[i], control[i])) return false
    }
  } else if (control && typeof control === 'object') {
    if (!isObject(value)) return false
    const keys = Object.keys(control)
    if (keys.length !== Object.keys(value).length) return false
    for (let key of keys) {
      if (!deepEqual(value[key], control[key])) return false
    }
  } else if (value !== control) return false

  return true
}

export function isEnum (value, assertion) {
  if (!isArray(value) || !value.length) return false

  const enumSet = new Set()
  for (let val of value) {
    val && typeof val === 'object' ? enumSet.add(JSON.stringify(val)) : enumSet.add(val)
  }
  if (value.length !== enumSet.size) return false

  if (assertion) {
    for (let val of value) {
      if (!assertion(val)) return false
    }
  }
  return true
}

export function isParentKeyword (parents) {
  const len = parents.length

  let check = false
  if (/^(?:properties|patternProperties|dependencies|definitions)$/.test(parents[len - 1])) check = true
  if (parents[len - 2] === 'properties') check = false

  for (let parent of parents) {
    if (/^(?:const|enum)$/.test(parent)) check = true
  }
  return check
}

export function isPathFragment ($ref) {
  return $ref[$ref.length - 1] === '/'
}

export function isRef (ref) {
  return /^(?:((?:(http|https):\/\/)(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(?:\.(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*(?::\d+)?\/)?((?:~(?=[01])|[^~])*)|#(?:~(?=[01])|[^~])*)$/.exec(decodeURI(ref))
}

export function isSchema (schema) {
  return isObject(schema) || isBoolean(schema)
}

export function isSchemaType (type) {
  return /^(?:array|boolean|integer|null|number|object|string)$/.test(type)
}

export function isSubSchema ($id, path) {
  const match = isRef($id)
  return isArray(match) && match[1] && match[2] && path[path.length - 2] === 'definitions'
}

export function isTypedArray (value, assertion) {
  for (let val of value) if (!assertion(val)) return false
  return true
}
