/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'

import AssertNumber from '../../../../src/assertions/builders/AssertNumber'
import { assertOptimized } from '../../../../src/assertions/types'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('AssertNumber', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('type keyword', () => {
    context('as integer', () => {
      const schema = { type: 'integer' }

      beforeEach(() => (assertions = AssertNumber.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized(1, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid values unsuccessfully', async () => {
        await expect(assertOptimized(1.1, schema, assertions)).to.be.rejected()
        await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
      })
    })

    context('as number', () => {
      const schema = { type: 'number' }

      beforeEach(() => (assertions = AssertNumber.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await expect(assertOptimized(1, schema, assertions)).to.be.fulfilled()
        await expect(assertOptimized(1.1, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value type unsuccessfully', async () => {
        await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
      })
    })
  })

  describe('maximum keyword', () => {
    const schema = { maximum: 1 }

    beforeEach(() => (assertions = AssertNumber.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized(0, schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(1, schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await expect(assertOptimized(2, schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.optimize({ maximum: null })
      } catch (e) {
        expect(e.message).to.equal('#maximum: keyword is not the right type')
      }
    })
  })

  describe('exclusiveMaximum keyword', () => {
    context('as a number', () => {
      const schema = { exclusiveMaximum: 1 }

      beforeEach(() => (assertions = AssertNumber.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await expect(assertOptimized(0, schema, assertions)).to.be.fulfilled()
        await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized(1, schema, assertions)).to.be.rejected()
      })
    })

    context('as a boolean', () => {
      const schema = { maximum: 1, exclusiveMaximum: true }

      beforeEach(() => (assertions = AssertNumber.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await expect(assertOptimized(0, schema, assertions)).to.be.fulfilled()
        await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized(1, schema, assertions)).to.be.rejected()
      })
    })

    it('should create optimized assertions successfully if both are numbers', () => {
      assertions = AssertNumber.optimize({ maximum: 1, exclusiveMaximum: 1 })

      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.optimize({ maximum: 1, exclusiveMaximum: null })
      } catch (e) {
        expect(e.message).to.equal('#exclusiveMaximum: keyword is not a boolean')
      }
    })
  })

  describe('minimum keyword', () => {
    const schema = { minimum: 1 }

    beforeEach(() => (assertions = AssertNumber.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized(1, schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(2, schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await expect(assertOptimized(0, schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.optimize({ minimum: null })
      } catch (e) {
        expect(e.message).to.equal('#minimum: keyword is not the right type')
      }
    })
  })

  describe('exclusiveMinimum keyword', () => {
    context('as a number', () => {
      const schema = { exclusiveMinimum: 1 }

      beforeEach(() => (assertions = AssertNumber.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await expect(assertOptimized(2, schema, assertions)).to.be.fulfilled()
        await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized(1, schema, assertions)).to.be.rejected()
      })
    })

    context('as a boolean', () => {
      const schema = { minimum: 1, exclusiveMinimum: true }

      beforeEach(() => (assertions = AssertNumber.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await expect(assertOptimized(2, schema, assertions)).to.be.fulfilled()
        await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized(1, schema, assertions)).to.be.rejected()
      })
    })

    it('should create optimized assertions successfully if both are numbers', () => {
      assertions = AssertNumber.optimize({ minimum: 1, exclusiveMinimum: 1 })

      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.optimize({ minimum: 1, exclusiveMinimum: null })
      } catch (e) {
        expect(e.message).to.equal('#exclusiveMinimum: keyword is not a boolean')
      }
    })
  })

  describe('multipleOf keyword', () => {
    const schema = { multipleOf: 2 }

    beforeEach(() => (assertions = AssertNumber.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized(4, schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await expect(assertOptimized(3, schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.optimize({ multipleOf: null })
      } catch (e) {
        expect(e.message).to.equal('#multipleOf: keyword is not the right type')
      }
    })
  })

  describe('complex number schemas', () => {
    const schema = { type: 'number', maximum: 1 }

    beforeEach(() => (assertions = AssertNumber.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized(0, schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized(1, schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid values unsuccessfully', async () => {
      await expect(assertOptimized(2, schema, assertions)).to.be.rejected()
      await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
    })
  })
})
