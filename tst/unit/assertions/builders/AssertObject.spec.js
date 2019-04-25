/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import AssertObject from '../../../../src/assertions/builders/AssertObject'
import AssertString from '../../../../src/assertions/builders/AssertString'
import { OPTIMIZED } from '../../../../src/assertions/types'
import { assertOptimized } from '../../../utils'

chai.use(dirtyChai)

describe('AssertObject', () => {
  const typeSchema = { type: 'object', maxProperties: 2, [OPTIMIZED]: AssertObject.optimize({ type: 'object', maxProperties: 1 }) }
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('type keyword', () => {
    const schema = { type: 'object' }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized({}, schema, assertions)).to.be.undefined()
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized(null, schema, assertions)
      expect(error.message).to.equal('#type: value is not an object')
    })
  })

  describe('properties keyword', () => {
    context('with standard schemas', () => {
      const schema = { properties: { property: typeSchema } }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ property: null }, schema, assertions)
        expect(error.message).to.equal('#type: value is not an object')
      })
    })

    context('with boolean schemas', () => {
      const schema = { properties: { foo: true, bar: false } }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({}, schema, assertions)).to.be.undefined()
        expect(assertOptimized({ foo: 1 }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized({ bar: 2 }, schema, assertions)
        expect(error.message).to.equal('#properties: \'false\' Schema invalidates all values')

        error = assertOptimized({ foo: 1, bar: 2 }, schema, assertions)
        expect(error.message).to.equal('#properties: \'false\' Schema invalidates all values')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ properties: null })
      } catch (e) {
        expect(e.message).to.equal('#properties: must be an Object')
      }
    })
  })

  describe('patternProperties keyword', () => {
    const schema = { patternProperties: { '^p': typeSchema, '^q': false } }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized({ property: {} }, schema, assertions)).to.be.undefined()
      expect(assertOptimized({ pattern: {}, property: {} }, schema, assertions)).to.be.undefined()
      expect(assertOptimized({ pattern: {}, property: {}, with_ignored: true }, schema, assertions)).to.be.undefined()
    })

    it('should assert optimized with invalid values unsuccessfully', () => {
      let error = assertOptimized({ pattern: null, property: null }, schema, assertions)
      expect(error.message).to.equal('#type: value is not an object')

      error = assertOptimized({ pattern: null, property: null }, schema, assertions)
      expect(error.message).to.equal('#type: value is not an object')

      error = assertOptimized({ query: 'not gonna allow this shit' }, schema, assertions)
      expect(error.message).to.equal('#patternProperties: \'false\' Schema invalidates all values')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ patternProperties: null })
      } catch (e) {
        expect(e.message).to.equal('#patternProperties: must be an Object')
      }
    })
  })

  describe('additionalProperties keyword', () => {
    context('as a boolean', () => {
      const schema = { properties: { property: typeSchema }, additionalProperties: false }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ additional: {}, property: {} }, schema, assertions)
        expect(error.message).to.equal('#additionalProperties: additional properties not allowed')
      })
    })

    context('as a schema', () => {
      const schema = { properties: { property: typeSchema }, additionalProperties: typeSchema }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).to.be.undefined()
        expect(assertOptimized({ additional: {}, property: {} }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ additional: null, property: {} }, schema, assertions)
        expect(error.message).to.equal('#type: value is not an object')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ properties: { property: typeSchema }, additionalProperties: null })
      } catch (e) {
        expect(e.message).to.equal('#additionalProperties: must be either a Schema or Boolean')
      }
    })
  })

  describe('dependencies keyword', () => {
    context('as an array', () => {
      const schema = { dependencies: { foo: ['bar'], be: false } }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ bar: 'anything' }, schema, assertions)).to.be.undefined()
        expect(assertOptimized({ foo: 'bar', bar: 'foo' }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        let error = assertOptimized({ foo: 'bar' }, schema, assertions)
        expect(error.message).to.equal('#dependencies: value does not have \'foo\' dependency')

        error = assertOptimized({ be: 'something' }, schema, assertions)
        expect(error.message).to.equal('#dependencies: \'false\' Schema invalidates all values')
      })
    })

    context('as a Schema', () => {
      const schema = { dependencies: { foo: typeSchema } }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ bar: 'anything' }, schema, assertions)).to.be.undefined()
        expect(assertOptimized({ foo: 'bar', bar: 'foo' }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ foo: 'bar', bar: 'foo', one: 'more' }, schema, assertions)
        expect(error.message).to.equal('#maxProperties: value maximum exceeded')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ dependencies: { foo: null } })
      } catch (e) {
        expect(e.message).to.equal('#dependencies: all dependencies must either be Schemas|enums')
      }
    })
  })

  describe('propertyNames keyword', () => {
    context('object JSON schema', () => {
      const schema = { propertyNames: { minLength: 2, [OPTIMIZED]: AssertString.optimize({ minLength: 2 }) } }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ p: {} }, schema, assertions)
        expect(error.message).to.equal('#minLength: value minimum not met')
      })
    })

    context('boolean JSON schema', () => {
      const schema = { propertyNames: false }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ p: {} }, schema, assertions)
        expect(error.message).to.equal('#propertyNames: \'false\' Schema invalidates all values')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ propertyNames: null })
      } catch (e) {
        expect(e.message).to.equal('#propertyNames: must be a Schema')
      }
    })
  })

  describe('required keyword', () => {
    const schema = { required: ['foo'] }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized({ foo: 1 }, schema, assertions)).to.be.undefined()
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized({ one: 1 }, schema, assertions)
      expect(error.message).to.equal('#required: value does not have all required properties')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ required: null })
      } catch (e) {
        expect(e.message).to.equal('#required: required properties must be defined in an array of strings')
      }
    })
  })

  describe('maxProperties keyword', () => {
    const schema = { maxProperties: 1 }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized({}, schema, assertions)).to.be.undefined()
      expect(assertOptimized({ one: 1 }, schema, assertions)).to.be.undefined()
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized({ one: 1, two: 2 }, schema, assertions)
      expect(error.message).to.equal('#maxProperties: value maximum exceeded')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ maxProperties: null })
      } catch (e) {
        expect(e.message).to.equal('#maxProperties: keyword must be a positive integer')
      }
    })
  })

  describe('minProperties keyword', () => {
    const schema = { minProperties: 1 }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized({ one: 1 }, schema, assertions)).to.be.undefined()
      expect(assertOptimized({ one: 1, two: 2 }, schema, assertions)).to.be.undefined()
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized({}, schema, assertions)
      expect(error.message).to.equal('#minProperties: value minimum not met')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ minProperties: null })
      } catch (e) {
        expect(e.message).to.equal('#minProperties: keyword must be a positive integer')
      }
    })
  })

  describe('complex object schemas', () => {
    context('with type defined', () => {
      const schema = { type: 'object', maxProperties: 1, [OPTIMIZED]: AssertObject.optimize({ type: 'object', maxProperties: 1 }) }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ one: 1 }, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized({ one: 1, two: 2 }, schema, assertions)
        expect(error.message).to.equal('#maxProperties: value maximum exceeded')

        error = assertOptimized(null, schema, assertions)
        expect(error.message).to.equal('#type: value is not an object')
      })
    })

    context('without enforced type', () => {
      const schema = { maxProperties: 1, [OPTIMIZED]: AssertObject.optimize({ maxProperties: 1 }) }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ one: 1 }, schema, assertions)).to.be.undefined()
        expect(assertOptimized(null, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ one: 1, two: 2 }, schema, assertions)
        expect(error.message).to.equal('#maxProperties: value maximum exceeded')
      })
    })

    context('with iterative validations', () => {
      const schema = { type: 'object', additionalProperties: {}, maxProperties: 1, minProperties: 1 }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions and validate successfully', () => {
        expect(assertOptimized({ anything: 'goes' }, schema, assertions)).to.be.undefined()
      })

      it('should create optimized assertions and validate unsuccessfully', () => {
        let error = assertOptimized(null, schema, assertions)
        expect(error.message).to.equal('#type: value is not an object')

        error = assertOptimized({}, schema, assertions)
        expect(error.message).to.equal('#minProperties: value minimum not met')

        error = assertOptimized({ not: 'always', anything: 'goes' }, schema, assertions)
        expect(error.message).to.equal('#maxProperties: value maximum exceeded')
      })
    })

    context('without a type defined', () => {
      const schema = { additionalProperties: {}, maxProperties: 1, minProperties: 1 }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should ignore non-object types', () => {
        expect(assertOptimized(null, schema, assertions)).to.be.undefined()
      })
    })
  })
})
