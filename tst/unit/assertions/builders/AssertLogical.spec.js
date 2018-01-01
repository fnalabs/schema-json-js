/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'

import AssertArray from '../../../../src/assertions/builders/AssertArray'
import AssertLogical from '../../../../src/assertions/builders/AssertLogical'
import { OPTIMIZED, assertOptimized } from '../../../../src/assertions/types'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('AssertLogical', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('optimizeAllOf', () => {
    const schema = { allOf: [
      { type: 'array', [OPTIMIZED]: AssertArray.optimize({ type: 'array' }) },
      { minItems: 1, [OPTIMIZED]: AssertArray.optimize({ minItems: 1 }) }
    ]}

    beforeEach(() => (assertions = AssertLogical.optimizeAllOf(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await expect(assertOptimized(['something'], schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid values unsuccessfully', async () => {
      await expect(assertOptimized([], schema, assertions)).to.be.rejected()
      await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.optimizeAllOf({ allOf: null })
      } catch (e) {
        expect(e.message).to.equal('#allOf: keyword should be an array of Schemas')
      }

      try {
        assertions = AssertLogical.optimizeAllOf({ allOf: [null] })
      } catch (e) {
        expect(e.message).to.equal('#allOf: keyword should be an array of Schemas')
      }
    })
  })

  describe('optimizeAnyOf', () => {
    const schema = { anyOf: [
      { type: 'array', maxItems: 1, [OPTIMIZED]: AssertArray.optimize({ type: 'array', maxItems: 3 }) },
      { type: 'array', minItems: 1, [OPTIMIZED]: AssertArray.optimize({ type: 'array', minItems: 1 }) }
    ]}

    beforeEach(() => (assertions = AssertLogical.optimizeAnyOf(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized([], schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(['something'], schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(['something', 'something'], schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.optimizeAnyOf({ anyOf: null })
      } catch (e) {
        expect(e.message).to.equal('#anyOf: keyword should be an array of Schemas')
      }

      try {
        assertions = AssertLogical.optimizeAnyOf({ anyOf: [null] })
      } catch (e) {
        expect(e.message).to.equal('#anyOf: keyword should be an array of Schemas')
      }
    })
  })

  describe('optimizeNot', () => {
    const schema = { not: { type: 'array', [OPTIMIZED]: AssertArray.optimize({ type: 'array' }) } }

    beforeEach(() => (assertions = AssertLogical.optimizeNot(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await expect(assertOptimized([], schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.optimizeNot({ not: null })
      } catch (e) {
        expect(e.message).to.equal('#not: keyword should be a Schema')
      }
    })
  })

  describe('optimizeOneOf', () => {
    const schema = { oneOf: [
      { type: 'array', minItems: 1, maxItems: 3, [OPTIMIZED]: AssertArray.optimize({ type: 'array', minItems: 1, maxItems: 3 }) },
      { type: 'array', minItems: 3, [OPTIMIZED]: AssertArray.optimize({ type: 'array', minItems: 1 }) }
    ]}

    beforeEach(() => (assertions = AssertLogical.optimizeOneOf(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized(['something'], schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(['something', 'something'], schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(['something', 'something', 'something', 'something'], schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid values unsuccessfully', async () => {
      await expect(assertOptimized([], schema, assertions)).to.be.rejected()
      await expect(assertOptimized(['something', 'something', 'something'], schema, assertions)).to.be.rejected()
      await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.optimizeOneOf({ oneOf: null })
      } catch (e) {
        expect(e.message).to.equal('#oneOf: keyword should be an array of Schemas')
      }

      try {
        assertions = AssertLogical.optimizeOneOf({ oneOf: [null] })
      } catch (e) {
        expect(e.message).to.equal('#oneOf: keyword should be an array of Schemas')
      }
    })
  })
})
