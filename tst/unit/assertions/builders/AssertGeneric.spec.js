/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import AssertGeneric from '../../../../src/assertions/builders/AssertGeneric'
import { assertOptimized } from '../../../../src/assertions/types'

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

      it('should assert optimized with valid value successfully', () => {
        expect(() => assertOptimized(1, schema, assertions)).to.not.throw()
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        try {
          assertOptimized(2, schema, assertions)
        } catch (e) {
          expect(e.message).to.equal('#const: value does not match the defined const')
        }
        try {
          assertOptimized(null, schema, assertions)
        } catch (e) {
          expect(e.message).to.equal('#const: value does not match the defined const')
        }
      })
    })

    context('as a complex object', () => {
      const schema = { const: { complex: 'object' } }

      beforeEach(() => (assertions = AssertGeneric.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
      })

      it('should assert optimized with valid value successfully', () => {
        expect(() => assertOptimized({ complex: 'object' }, schema, assertions)).to.not.throw()
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        try {
          assertOptimized({ another: 'object' }, schema, assertions)
        } catch (e) {
          expect(e.message).to.equal('#const: value does not match the defined const')
        }
        try {
          assertOptimized(null, schema, assertions)
        } catch (e) {
          expect(e.message).to.equal('#const: value does not match the defined const')
        }
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

    it('should assert optimized with valid values successfully', () => {
      expect(() => assertOptimized(1, schema, assertions)).to.not.throw()
      expect(() => assertOptimized({ complex: 'object' }, schema, assertions)).to.not.throw()
    })

    it('should assert optimized with invalid values unsuccessfully', () => {
      try {
        assertOptimized({ another: 'object' }, schema, assertions)
      } catch (e) {
        expect(e.message).to.equal('#enum: value does not match anything in the enum')
      }
      try {
        assertOptimized(null, schema, assertions)
      } catch (e) {
        expect(e.message).to.equal('#enum: value does not match anything in the enum')
      }
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
