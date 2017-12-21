/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import AssertArray from '../../../../src/assertions/builders/AssertArray'
import { OPTIMIZED, assertOptimized } from '../../../../src/assertions/types'

chai.use(dirtyChai)

describe('AssertArray', () => {
  const typeSchema = { type: 'array', [OPTIMIZED]: AssertArray.optimize({ type: 'array' }) }
  const errors = []
  let assertions

  afterEach(() => {
    errors.length = 0
    assertions = null
  })

  describe('type keyword', () => {
    const schema = { type: 'array' }

    beforeEach(() => (assertions = AssertArray.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized([], schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized(null, schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })
  })

  describe('items keyword', () => {
    context('as a schema', () => {
      const schema = { items: typeSchema }

      beforeEach(() => (assertions = AssertArray.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized([[]], schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized([null], schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })
    })

    context('as an array of schemas', () => {
      const schema = { items: [typeSchema, typeSchema] }

      beforeEach(() => (assertions = AssertArray.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await assertOptimized([[]], schema, assertions, errors)
        expect(errors.length).to.equal(0)

        await assertOptimized([[], []], schema, assertions, errors)
        expect(errors.length).to.equal(0)

        await assertOptimized([[], [], []], schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized([null, null], schema, assertions, errors)
        expect(errors.length).to.equal(2)
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.optimize({ items: null })
      } catch (e) {
        expect(e.message).to.equal('#items: must be either a Schema or an Array of Schemas')
      }
    })
  })

  describe('additionalItems keyword', () => {
    context('as a boolean', () => {
      const schema = { items: [typeSchema], additionalItems: false }

      beforeEach(() => (assertions = AssertArray.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await assertOptimized([[]], schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized([[], []], schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })
    })

    context('as a schema', () => {
      const schema = { items: [typeSchema], additionalItems: typeSchema }

      beforeEach(() => (assertions = AssertArray.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await assertOptimized([[]], schema, assertions, errors)
        expect(errors.length).to.equal(0)

        await assertOptimized([[], []], schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized([[], null], schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.optimize({ items: [{}], additionalItems: null })
      } catch (e) {
        expect(e.message).to.equal('#additionalItems: must be either a Schema or Boolean')
      }
    })
  })

  describe('contains keyword', () => {
    const schema = { contains: typeSchema }

    beforeEach(() => (assertions = AssertArray.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    // TODO: fix contains keyword implementation
    // it('should assert optimized with valid values successfully', async () => {
    //   await assertOptimized([1, []], schema, assertions, errors)
    //   expect(errors.length).to.equal(0)
    // })

    // it('should assert optimized with valid values successfully', async () => {
    //   await assertOptimized([[], 2], schema, assertions, errors)
    //   expect(errors.length).to.equal(0)
    // })

    // it('should assert optimized with invalid values unsuccessfully', async () => {
    //   await assertOptimized([1, 2], schema, assertions, errors)
    //   expect(errors.length).to.equal(1)
    // })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.optimize({ contains: null })
      } catch (e) {
        expect(e.message).to.equal('#contains: keyword should be an object')
      }
    })
  })

  describe('maxItems keyword', () => {
    const schema = { maxItems: 1 }

    beforeEach(() => (assertions = AssertArray.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized([], schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized([1, 2], schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.optimize({ maxItems: null })
      } catch (e) {
        expect(e.message).to.equal('#maxItems: keyword must be a positive integer')
      }
    })
  })

  describe('minItems keyword', () => {
    const schema = { minItems: 1 }

    beforeEach(() => (assertions = AssertArray.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized([1], schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized([], schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.optimize({ minItems: null })
      } catch (e) {
        expect(e.message).to.equal('#minItems: keyword must be a positive integer')
      }
    })
  })

  describe('uniqueItems keyword', () => {
    const schema = { uniqueItems: true }

    beforeEach(() => (assertions = AssertArray.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid primitive values successfully', async () => {
      await assertOptimized([1, 2], schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid primitive values unsuccessfully', async () => {
      await assertOptimized([1, 1], schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should assert optimized with valid complex values successfully', async () => {
      await assertOptimized([schema, 1], schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid primitive values unsuccessfully', async () => {
      await assertOptimized([schema, schema], schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.optimize({ uniqueItems: null })
      } catch (e) {
        expect(e.message).to.equal('#minItems: keyword must be a positive integer')
      }
    })
  })

  describe('complex array schemas', () => {
    context('with enforced type', () => {
      const schema = { type: 'array', maxItems: 3, minItems: 1 }

      beforeEach(() => (assertions = AssertArray.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized([1], schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })
    })

    context('without enforced type', () => {
      const schema = { maxItems: 3, minItems: 1 }

      beforeEach(() => (assertions = AssertArray.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized([1], schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with non-array successfully', async () => {
        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })
    })
  })
})
