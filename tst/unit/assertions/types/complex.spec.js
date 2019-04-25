/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import * as complex from '../../../../src/assertions/types/complex'
import { isNumber } from '../../../../src/assertions/types'

chai.use(dirtyChai)

describe('primitive assertions', () => {
  it('should test complex objects successfully', () => {
    expect(complex.deepEqual([], [])).to.be.true()
    expect(complex.deepEqual([1, 2, 3, 4], [1, 2, 3, 4])).to.be.true()
    expect(complex.deepEqual(null, [])).to.be.false()
    expect(complex.deepEqual([1, 2, 3, 4, 5], [1, 2, 3, 4])).to.be.false()
    expect(complex.deepEqual([1, 2, 3, 4], [1, 2, 3, 4, 5])).to.be.false()
    expect(complex.deepEqual([1, 2, 3, 4, 6], [1, 2, 3, 4, 5])).to.be.false()

    expect(complex.deepEqual({}, {})).to.be.true()
    expect(complex.deepEqual({ one: 1, two: 2 }, { one: 1, two: 2 })).to.be.true()
    expect(complex.deepEqual(null, {})).to.be.false()
    expect(complex.deepEqual({ one: 1, two: 2 }, { one: 1, two: 2, three: 3 })).to.be.false()
    expect(complex.deepEqual({ one: 1, two: 2, three: 3 }, { one: 1, two: 2 })).to.be.false()
    expect(complex.deepEqual({ one: 1, two: 3 }, { one: 1, two: 2 })).to.be.false()

    expect(complex.deepEqual('1', '1')).to.be.true()
    expect(complex.deepEqual(1, 0)).to.be.false()
    expect(complex.deepEqual(1, '1')).to.be.false()
  })

  it('should test enums successfully', () => {
    expect(complex.isEnum([1])).to.be.true()
    expect(complex.isEnum([1, 2])).to.be.true()
    expect(complex.isEnum([1, '2'])).to.be.true()
    expect(complex.isEnum([1, { two: 2 }])).to.be.true()
    expect(complex.isEnum([])).to.be.false()
    expect(complex.isEnum([1, 1])).to.be.false()
    expect(complex.isEnum([{ one: 1 }, { one: 1 }])).to.be.false()

    expect(complex.isEnum([1], isNumber)).to.be.true()
    expect(complex.isEnum([1, 2], isNumber)).to.be.true()
    expect(complex.isEnum([1, '2'], isNumber)).to.be.false()
    expect(complex.isEnum([1, { two: 2 }], isNumber)).to.be.false()
    expect(complex.isEnum([1, 1], isNumber)).to.be.false()
    expect(complex.isEnum([{ one: 1 }, { one: 1 }], isNumber)).to.be.false()
  })

  it('should test for parent keywords successfully', () => {
    expect(complex.isParentKeyword(['properties'])).to.be.true()
    expect(complex.isParentKeyword(['patternProperties'])).to.be.true()
    expect(complex.isParentKeyword(['dependencies'])).to.be.true()
    expect(complex.isParentKeyword(['const'])).to.be.true()
    expect(complex.isParentKeyword(['a', 'longer', 'path', 'to', 'const'])).to.be.true()
    expect(complex.isParentKeyword(['enum'])).to.be.true()
    expect(complex.isParentKeyword(['a', 'longer', 'path', 'to', 'enum'])).to.be.true()
    expect(complex.isParentKeyword([])).to.be.false()
    expect(complex.isParentKeyword(['something', 'else'])).to.be.false()
  })

  it('should test for path fragments successfully', () => {
    expect(complex.isPathFragment('folder/')).to.be.true()
    expect(complex.isPathFragment('folder')).to.be.false()
  })

  it('should test for refs successfully', () => {
    expect(complex.isRef('http://localhost:1234/node#something')).to.be.ok()
    expect(complex.isRef('http://localhos~t:1234/node#something')).to.not.be.ok()
  })

  it('should test for Schemas successfully', () => {
    expect(complex.isSchema({})).to.be.true()
    expect(complex.isSchema(true)).to.be.true()
    expect(complex.isSchema(false)).to.be.true()
    expect(complex.isSchema(null)).to.be.false()
  })

  it('should test for valid schema types successfully', () => {
    expect(complex.isSchemaType('array')).to.be.true()
    expect(complex.isSchemaType('boolean')).to.be.true()
    expect(complex.isSchemaType('integer')).to.be.true()
    expect(complex.isSchemaType('null')).to.be.true()
    expect(complex.isSchemaType('number')).to.be.true()
    expect(complex.isSchemaType('object')).to.be.true()
    expect(complex.isSchemaType('string')).to.be.true()
    expect(complex.isSchemaType('something else')).to.be.false()
  })

  it('should test for nested schema definitions', () => {
    expect(complex.isSubSchema('http://test.com/v1/schema', ['definitions', 'schema'])).to.be.true()
    expect(complex.isSubSchema('http://test.com/v1/schema', ['properties', 'schema'])).to.be.false()
    expect(complex.isSubSchema('http://te~st.com/v1/schema', ['definitions', 'schema'])).to.be.false()
    expect(complex.isSubSchema('schema', ['definitions', 'schema'])).to.not.be.ok()
  })

  it('should test for typed arrays', () => {
    expect(complex.isTypedArray([1, 2, 3, 4], isNumber)).to.be.true()
    expect(complex.isTypedArray([1, '2', 3, 4], isNumber)).to.be.false()
    expect(complex.isTypedArray([1, 2, 3, '4'], isNumber)).to.be.false()
  })
})
