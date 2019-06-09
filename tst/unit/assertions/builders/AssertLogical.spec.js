/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import AssertArray from '../../../../src/assertions/builders/AssertArray'
import AssertLogical from '../../../../src/assertions/builders/AssertLogical'
import { OPTIMIZED } from '../../../../src/assertions/types'
import { assertOptimized } from '../../../utils'

chai.use(dirtyChai)

describe('AssertLogical', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('optimizeAllOf', () => {
    context('object JSON schemas', () => {
      const schema = { allOf: [
        { type: 'array', [OPTIMIZED]: AssertArray.optimize({ type: 'array' }).pop() },
        { minItems: 1, [OPTIMIZED]: AssertArray.optimize({ minItems: 1 }).pop() }
      ] }

      beforeEach(() => (assertions = AssertLogical.optimizeAllOf(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized(['something'], schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized([], schema, assertions)
        expect(error).to.equal('#minItems: value minimum not met')

        error = assertOptimized(null, schema, assertions)
        expect(error).to.equal('#type: value is not an array')
      })

      it('should throw an error on invalid type', () => {
        try {
          assertions = AssertLogical.optimizeAllOf({ allOf: null })
        } catch (e) {
          expect(e.message).to.equal('#allOf: keyword should be an array of JSON Schemas')
        }

        try {
          assertions = AssertLogical.optimizeAllOf({ allOf: [null] })
        } catch (e) {
          expect(e.message).to.equal('#allOf: keyword should be an array of JSON Schemas')
        }
      })
    })

    context('boolean JSON schemas', () => {
      const schema = { allOf: [
        { type: 'array', [OPTIMIZED]: AssertArray.optimize({ type: 'array' }).pop() },
        false
      ] }

      beforeEach(() => (assertions = AssertLogical.optimizeAllOf(schema)))

      it('should assert optimized with invalid values unsuccessfully', () => {
        const error = assertOptimized([], schema, assertions)
        expect(error).to.equal('#allOf: \'false\' JSON Schema invalidates all values')
      })
    })
  })

  describe('optimizeAnyOf', () => {
    context('object JSON schemas', () => {
      const schema = { anyOf: [
        { type: 'array', maxItems: 1, [OPTIMIZED]: AssertArray.optimize({ type: 'array', maxItems: 3 }).pop() },
        { type: 'array', minItems: 1, [OPTIMIZED]: AssertArray.optimize({ type: 'array', minItems: 1 }).pop() }
      ] }

      beforeEach(() => (assertions = AssertLogical.optimizeAnyOf(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([], schema, assertions)).to.be.undefined()
        expect(assertOptimized(['something'], schema, assertions)).to.be.undefined()
        expect(assertOptimized(['something', 'something'], schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(null, schema, assertions)
        expect(error).to.equal('#anyOf: none of the defined JSON Schemas match the value')
      })
    })

    context('boolean JSON schemas', () => {
      const schema = { anyOf: [true, false] }

      beforeEach(() => (assertions = AssertLogical.optimizeAnyOf(schema)))

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([null], schema, assertions)).to.be.undefined()
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.optimizeAnyOf({ anyOf: null })
      } catch (e) {
        expect(e.message).to.equal('#anyOf: keyword should be an array of JSON Schemas')
      }

      try {
        assertions = AssertLogical.optimizeAnyOf({ anyOf: [null] })
      } catch (e) {
        expect(e.message).to.equal('#anyOf: keyword should be an array of JSON Schemas')
      }
    })
  })

  describe('optimizeNot', () => {
    context('object JSON schema', () => {
      const schema = { not: { type: 'array', [OPTIMIZED]: AssertArray.optimize({ type: 'array' }).pop() } }

      beforeEach(() => (assertions = AssertLogical.optimizeNot(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized(null, schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized([], schema, assertions)
        expect(error).to.equal('#not: value validated successfully against the schema')
      })
    })

    context('boolean JSON schemas', () => {
      const schema = { not: false }

      beforeEach(() => (assertions = AssertLogical.optimizeNot(schema)))

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(null, schema, assertions)).to.be.undefined()
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.optimizeNot({ not: null })
      } catch (e) {
        expect(e.message).to.equal('#not: keyword should be a JSON Schema')
      }
    })
  })

  describe('optimizeOneOf', () => {
    context('object JSON schemas', () => {
      const schema = { oneOf: [
        { type: 'array', minItems: 1, maxItems: 3, [OPTIMIZED]: AssertArray.optimize({ type: 'array', minItems: 1, maxItems: 3 }).pop() },
        { type: 'array', minItems: 3, [OPTIMIZED]: AssertArray.optimize({ type: 'array', minItems: 1 }).pop() }
      ] }

      beforeEach(() => (assertions = AssertLogical.optimizeOneOf(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(['something'], schema, assertions)).to.be.undefined()
        expect(assertOptimized(['something', 'something'], schema, assertions)).to.be.undefined()
        expect(assertOptimized(['something', 'something', 'something', 'something'], schema, assertions)).to.be.undefined()
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized([], schema, assertions)
        expect(error).to.equal('#oneOf: value should match only one of the listed schemas')

        error = assertOptimized(['something', 'something', 'something'], schema, assertions)
        expect(error).to.equal('#oneOf: value should match only one of the listed schemas')

        error = assertOptimized(null, schema, assertions)
        expect(error).to.equal('#oneOf: value should match only one of the listed schemas')
      })
    })

    context('boolean JSON schemas', () => {
      const schema = { oneOf: [
        { type: 'array', minItems: 1, maxItems: 3, [OPTIMIZED]: AssertArray.optimize({ type: 'array', minItems: 1, maxItems: 3 }).pop() },
        true,
        false
      ] }

      beforeEach(() => (assertions = AssertLogical.optimizeOneOf(schema)))

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(null, schema, assertions)).to.be.undefined()
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.optimizeOneOf({ oneOf: null })
      } catch (e) {
        expect(e.message).to.equal('#oneOf: keyword should be an array of JSON Schemas')
      }

      try {
        assertions = AssertLogical.optimizeOneOf({ oneOf: [null] })
      } catch (e) {
        expect(e.message).to.equal('#oneOf: keyword should be an array of JSON Schemas')
      }
    })
  })
})
