/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import AssertGeneric from '../../../../src/assertions/builders/AssertGeneric'
import { assertOptimized } from '../../../../src/assertions/types'

chai.use(dirtyChai)

describe('AssertGeneric', () => {
  const errors = []
  let assertions

  afterEach(() => {
    errors.length = 0
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
        await assertOptimized(1, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized(2, schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })

      it('should assert optimized with invalid value type unsuccessfully', async () => {
        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized({ complex: 'object' }, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized({ another: 'object' }, schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })

      it('should assert optimized with invalid value type unsuccessfully', async () => {
        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(1)
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

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized(1, schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized({ complex: 'object' }, schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized({ another: 'object' }, schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should assert optimized with invalid value type unsuccessfully', async () => {
      await assertOptimized(null, schema, assertions, errors)
      expect(errors.length).to.equal(1)
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
