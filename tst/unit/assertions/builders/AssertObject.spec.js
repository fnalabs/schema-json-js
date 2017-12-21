/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import AssertObject from '../../../../src/assertions/builders/AssertObject'
import AssertString from '../../../../src/assertions/builders/AssertString'
import { OPTIMIZED, assertOptimized } from '../../../../src/assertions/types'

chai.use(dirtyChai)

describe('AssertObject', () => {
  const typeSchema = { type: 'object', maxProperties: 2, [OPTIMIZED]: AssertObject.optimize({ type: 'object', maxProperties: 1 }) }
  const errors = []
  let assertions

  afterEach(() => {
    errors.length = 0
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

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized({}, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized(null, schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })
  })

  describe('properties keyword', () => {
    const schema = { properties: { property: typeSchema } }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized({ property: {} }, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized({ property: null }, schema, assertions, errors)
      expect(errors.length).to.equal(1)
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
    const schema = { patternProperties: { '^p': typeSchema } }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized({ property: {} }, schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized({ pattern: {}, property: {} }, schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized({ pattern: {}, property: {}, with_ignored: true }, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized({ property: null }, schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should assert optimized with invalid values unsuccessfully', async () => {
      await assertOptimized({ pattern: null, property: null }, schema, assertions, errors)
      expect(errors.length).to.equal(2)
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

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized({ property: {} }, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid values unsuccessfully', async () => {
        await assertOptimized({ additional: {}, property: {} }, schema, assertions, errors)
        expect(errors.length).to.equal(1)
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

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized({ property: {} }, schema, assertions, errors)
        expect(errors.length).to.equal(0)

        await assertOptimized({ additional: {}, property: {} }, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid values unsuccessfully', async () => {
        await assertOptimized({ additional: null, property: {} }, schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
      const schema = { dependencies: { foo: ['bar'] } }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized({ bar: 'anything' }, schema, assertions, errors)
        expect(errors.length).to.equal(0)

        await assertOptimized({ foo: 'bar', bar: 'foo' }, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid values unsuccessfully', async () => {
        await assertOptimized({ foo: 'bar' }, schema, assertions, errors)
        expect(errors.length).to.equal(1)
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

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized({ bar: 'anything' }, schema, assertions, errors)
        expect(errors.length).to.equal(0)

        await assertOptimized({ foo: 'bar', bar: 'foo' }, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid values unsuccessfully', async () => {
        await assertOptimized({ foo: 'bar', bar: 'foo', one: 'more' }, schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ dependencies: { foo: null } })
      } catch (e) {
        expect(e.message).to.equal('#dependencies: all dependencies must either be schemas|enums')
      }
    })
  })

  describe('propertyNames keyword', () => {
    const schema = { propertyNames: { minLength: 2, [OPTIMIZED]: AssertString.optimize({ minLength: 2 }) } }

    beforeEach(() => (assertions = AssertObject.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized({ property: {} }, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized({ p: {} }, schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.optimize({ propertyNames: null })
      } catch (e) {
        expect(e.message).to.equal('#propertyNames: must be an object')
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

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized({ foo: 1 }, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized({ one: 1 }, schema, assertions, errors)
      expect(errors.length).to.equal(1)
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

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized({}, schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized({ one: 1 }, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized({ one: 1, two: 2 }, schema, assertions, errors)
      expect(errors.length).to.equal(1)
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

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized({ one: 1 }, schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized({ one: 1, two: 2 }, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized({}, schema, assertions, errors)
      expect(errors.length).to.equal(1)
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

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized({ one: 1 }, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized({ one: 1, two: 2 }, schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })

      it('should assert optimized with invalid value type unsuccessfully', async () => {
        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })
    })

    context('without type defined', () => {
      const schema = { maxProperties: 1, [OPTIMIZED]: AssertObject.optimize({ maxProperties: 1 }) }

      beforeEach(() => (assertions = AssertObject.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized({ one: 1 }, schema, assertions, errors)
        expect(errors.length).to.equal(0)

        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized({ one: 1, two: 2 }, schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })
    })
  })
})
