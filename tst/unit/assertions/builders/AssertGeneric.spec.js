/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'

import AssertGeneric from '../../../../src/assertions/builders/AssertGeneric'
import { assertOptimized } from '../../../../src/assertions/types'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('AssertGeneric', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('const keyword', () => {
    context('as a primitive', () => {
      const schema = { const: 1 }

      beforeEach(() => (assertions = AssertGeneric.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized(1, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid values unsuccessfully', async () => {
        await expect(assertOptimized(2, schema, assertions)).to.be.rejected()
        await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
      })
    })

    context('as a complex object', () => {
      const schema = { const: { complex: 'object' } }

      beforeEach(() => (assertions = AssertGeneric.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized({ complex: 'object' }, schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid values unsuccessfully', async () => {
        await expect(assertOptimized({ another: 'object' }, schema, assertions)).to.be.rejected()
        await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
      })
    })
  })

  describe('enum keyword', () => {
    const schema = { enum: [1, {complex: 'object'}] }

    beforeEach(() => (assertions = AssertGeneric.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized(1, schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized({ complex: 'object' }, schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid values unsuccessfully', async () => {
      await expect(assertOptimized({ another: 'object' }, schema, assertions)).to.be.rejected()
      await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid enum', () => {
      try {
        assertions = AssertGeneric.optimize({ enum: null })
      } catch (e) {
        expect(e.message).to.equal('#enum: invalid enum, check format and for duplicates')
      }
    })
  })
})
