import { assertSizeMax, assertSizeMin, isInteger, isString, isUndefined } from '../types'

const isEmailRegex = /^[^@]+@[^@]+\.[^@]+$/
const isHostnameRegex = /^(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(?:\.(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*$/
const isIpv4Regex = /^(\d?\d?\d){0,255}\.(\d?\d?\d){0,255}\.(\d?\d?\d){0,255}\.(\d?\d?\d){0,255}$/
const isIpv6Regex = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/
const isRegex = /[^\\]\\Z/
const isUriRegex = /^[A-Za-z][A-Za-z0-9+\-.]*:(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?|(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|)(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?$/
const isUriRefRegex = /^(?:[A-Za-z][A-Za-z0-9+\-.]*:(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?|(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|)(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?|(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?|(?:[A-Za-z0-9\-._~!$&'()*+,;=@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|)(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?)$/i
const isUriTplRegex = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i // eslint-disable-line no-control-regex
const isJsonPtrRegex = /^$|^\/(?:~(?=[01])|[^~])*$/i

// private methods
const ASSERT_FORMAT = Symbol('validates string format')
const ASSERT_PATTERN = Symbol('validates string pattern')

function stringLength (str) {
  let length = 0
  for (let i = 0, len = str.length; i < len; i++) {
    const currChar = str.charCodeAt(i)
    const nextChar = str.charCodeAt(i + 1)
    if (currChar >= 0xD800 && currChar <= 0xDBFF && nextChar >= 0xDC00 && nextChar <= 0xDFFF) i++
    length++
  }
  return length
}

export default class AssertString {
  constructor () {
    return AssertString
  }

  /*
   * string assertions
   */
  static optimize (schema) {
    const { type, format, maxLength, minLength, pattern } = schema
    let assertFormat
    let patternRegExp

    // perform remaining validations defined in schema
    if (!isUndefined(format)) assertFormat = AssertString[ASSERT_FORMAT](format, type)
    if (!isUndefined(maxLength)) assertSizeMax(maxLength, 'maxLength')
    if (!isUndefined(minLength)) assertSizeMin(minLength, 'minLength')
    if (!isUndefined(pattern)) patternRegExp = AssertString[ASSERT_PATTERN](pattern, type)

    // return validations based on defined keywords
    if (assertFormat || patternRegExp || isInteger(maxLength) || isInteger(minLength)) {
      return [(value, ref) => {
        if (!isString(value)) {
          if (ref.type === 'string') return '#type: value is not a string'
          return
        }

        if (assertFormat) {
          const error = assertFormat(value)
          if (error) return error
        }
        if (typeof ref.maxLength === 'number' && !(value.length <= ref.maxLength || stringLength(value) <= ref.maxLength)) {
          return '#maxLength: value maximum exceeded'
        }
        if (typeof ref.minLength === 'number' && (value.length < ref.minLength || stringLength(value) < ref.minLength)) {
          return '#minLength: value minimum not met'
        }
        if (patternRegExp && !patternRegExp.test(value)) {
          return `#pattern: value does not match pattern '${ref.pattern}'`
        }
      }]
    } else if (type === 'string') {
      return [(value, ref) => {
        if (!isString(value)) return '#type: value is not a string'
      }]
    }
    return []
  }

  static [ASSERT_FORMAT] (format) {
    if (!isString(format)) {
      throw new TypeError('#format: keyword is not a string')
    }

    // determine the desired format to valiate
    switch (format) {
      case 'date-time':
        return (value, ref) => {
          if (isNaN(Date.parse(value)) || ~value.indexOf('/')) {
            return '#format: value does not match "date-time" format'
          }
        }
      case 'email':
        return (value, ref) => {
          if (!isEmailRegex.test(value)) {
            return '#format: value does not match "email" format'
          }
        }
      case 'hostname':
        return (value, ref) => {
          if (value.length > 255 || !isHostnameRegex.test(value)) {
            return '#format: value does not match "hostname" format'
          }
        }
      case 'ipv4':
        return (value, ref) => {
          if (!isIpv4Regex.test(value) || value.split('.')[3] > 255) {
            return '#format: value does not match "ipv4" format'
          }
        }
      case 'ipv6':
        return (value, ref) => {
          if (!isIpv6Regex.test(value)) {
            return '#format: value does not match "ipv6" format'
          }
        }
      case 'regex':
        return (value, ref) => {
          if (isRegex.test(value)) return '#format: ECMA 262 has no support for \\Z anchor from .NET'
          try { new RegExp(value) } catch (e) { return '#format: value is not a valid "regex" format' } // eslint-disable-line no-new
        }
      case 'uri':
        return (value, ref) => {
          if (!isUriRegex.test(value)) {
            return '#format: value does not match "uri" format'
          }
        }
      case 'uri-reference':
        return (value, ref) => {
          if (!isUriRefRegex.test(value)) {
            return '#format: value does not match "uri-reference" format'
          }
        }
      case 'uri-template':
        return (value, ref) => {
          if (!isUriTplRegex.test(value)) {
            return '#format: value does not match "uri-template" format'
          }
        }
      case 'json-pointer':
        return (value, ref) => {
          if (!isJsonPtrRegex.test(value)) {
            return '#format: value does not match "json-pointer" format'
          }
        }
      default:
        throw new TypeError(`#format: '${format}' is not supported`)
    }
  }

  static [ASSERT_PATTERN] (pattern) {
    if (!isString(pattern)) {
      throw new TypeError('#pattern: keyword is not a string')
    }
    return new RegExp(pattern)
  }
}
