/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import * as primitive from '../../../../src/assertions/types/primitive'

chai.use(dirtyChai)

describe('primitive assertions', () => {
  it('should test array types successfully', () => {
    expect(primitive.isArray([])).to.be.true()
    expect(primitive.isArray(null)).to.be.false()
  })

  it('should test boolean types successfully', () => {
    expect(primitive.isBoolean(false)).to.be.true()
    expect(primitive.isBoolean(null)).to.be.false()
  })

  it('should test function types successfully', () => {
    expect(primitive.isFunction(() => {})).to.be.true()
    expect(primitive.isFunction(async () => {})).to.be.true()
    expect(primitive.isFunction(function () {})).to.be.true()
    expect(primitive.isFunction(function name () {})).to.be.true()
    expect(primitive.isFunction(null)).to.be.false()
  })

  it('should test integer types successfully', () => {
    expect(primitive.isInteger(1)).to.be.true()
    expect(primitive.isInteger(2)).to.be.true()
    expect(primitive.isInteger(1.1)).to.be.false()
    expect(primitive.isInteger(null)).to.be.false()
  })

  it('should test null types successfully', () => {
    expect(primitive.isNull(null)).to.be.true()
    expect(primitive.isNull(true)).to.be.false()
  })

  it('should test number types successfully', () => {
    expect(primitive.isNumber(1)).to.be.true()
    expect(primitive.isNumber(2)).to.be.true()
    expect(primitive.isNumber(1.1)).to.be.true()
    expect(primitive.isNumber(null)).to.be.false()
  })

  it('should test object types successfully', () => {
    expect(primitive.isObject({})).to.be.true()
    expect(primitive.isObject({simple: 'object'})).to.be.true()
    expect(primitive.isObject(null)).to.not.be.ok()
    expect(primitive.isObject([])).to.be.false()
  })

  it('should test string types successfully', () => {
    expect(primitive.isString('')).to.be.true()
    expect(primitive.isString('something')).to.be.true()
    expect(primitive.isString('\uD83D\uDCA9')).to.be.true()
    expect(primitive.isString(null)).to.be.false()
  })

  it('should test undefined types successfully', () => {
    expect(primitive.isUndefined(undefined)).to.be.true()
    expect(primitive.isUndefined(null)).to.be.false()
  })
})
