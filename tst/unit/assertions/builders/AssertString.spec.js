/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'

import AssertString from '../../../../src/assertions/builders/AssertString'
import { assertOptimized } from '../../../../src/assertions/types'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

describe('AssertString', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('type keyword', () => {
    const schema = { type: 'string' }

    beforeEach(() => (assertions = AssertString.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await expect(assertOptimized('', schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
    })
  })

  describe('format keyword', () => {
    context('as date-time', () => {
      const schema = { format: 'date-time' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('1963-06-19T08:30:06.283185Z', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('06/19/1963 08:30:06 PST', schema, assertions)).to.be.rejected()
      })
    })

    context('as email', () => {
      const schema = { format: 'email' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('joe.bloggs@example.com', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('2962', schema, assertions)).to.be.rejected()
      })
    })

    context('as ipv4', () => {
      const schema = { format: 'ipv4' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('192.168.0.1', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('127.0', schema, assertions)).to.be.rejected()
      })
    })

    context('as ipv6', () => {
      const schema = { format: 'ipv6' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('::1', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('12345::', schema, assertions)).to.be.rejected()
      })
    })

    context('as hostname', () => {
      const schema = { format: 'hostname' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('www.example.com', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('-a-host-name-that-starts-with--', schema, assertions)).to.be.rejected()
      })
    })

    context('as json-pointer', () => {
      const schema = { format: 'json-pointer' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('/foo/bar~0/baz~1/%a', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('/foo/bar~', schema, assertions)).to.be.rejected()
      })
    })

    context('as regex', () => {
      const schema = { format: 'regex' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('^a', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('[', schema, assertions)).to.be.rejected()
        await expect(assertOptimized('^\\S(|(.|\\n)*\\S)\\Z', schema, assertions)).to.be.rejected()
      })
    })

    context('as uri', () => {
      const schema = { format: 'uri' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('http://foo.bar/?baz=qux#quux', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('//foo.bar/?baz=qux#quux', schema, assertions)).to.be.rejected()
      })
    })

    context('as uri-reference', () => {
      const schema = { format: 'uri-reference' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('/abc', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('\\\\WINDOWS\\fileshare', schema, assertions)).to.be.rejected()
      })
    })

    context('as uri-template', () => {
      const schema = { format: 'uri-template' }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('http://example.com/dictionary/{term:1}/{term}', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized('http://example.com/dictionary/{term:1}/{term', schema, assertions)).to.be.rejected()
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.optimize({ format: null })
      } catch (e) {
        expect(e.message).to.equal('#format: keyword is not a string')
      }

      try {
        assertions = AssertString.optimize({ format: 'string' })
      } catch (e) {
        expect(e.message).to.equal('#format: \'string\' is not supported')
      }
    })
  })

  describe('maxLength keyword', () => {
    const schema = { maxLength: 2 }

    beforeEach(() => (assertions = AssertString.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized('', schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized('1', schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized('12', schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized('\uD83D\uDCA9', schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized('\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid values unsuccessfully', async () => {
      await expect(assertOptimized('123', schema, assertions)).to.be.rejected()
      await expect(assertOptimized('\uD83D\uDCA9\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.optimize({ maxLength: null })
      } catch (e) {
        expect(e.message).to.equal('#maxLength: keyword must be a positive integer')
      }
    })
  })

  describe('minLength keyword', () => {
    const schema = { minLength: 2 }

    beforeEach(() => (assertions = AssertString.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid values successfully', async () => {
      await expect(assertOptimized('12', schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized('123', schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized('\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)).to.be.fulfilled()
      await expect(assertOptimized('\uD83D\uDCA9\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid values unsuccessfully', async () => {
      await expect(assertOptimized('1', schema, assertions)).to.be.rejected()
      await expect(assertOptimized('\uD83D\uDCA9', schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.optimize({ minLength: null })
      } catch (e) {
        expect(e.message).to.equal('#minLength: keyword must be a positive integer')
      }
    })
  })

  describe('pattern keyword', () => {
    const schema = { pattern: '^a*$' }

    beforeEach(() => (assertions = AssertString.optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(assertions).to.be.an('array')
      expect(assertions.length).to.equal(1)
      expect(assertions[0]).to.be.a('function')
    })

    it('should assert optimized with valid value successfully', async () => {
      await expect(assertOptimized('aaa', schema, assertions)).to.be.fulfilled()
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await expect(assertOptimized('abc', schema, assertions)).to.be.rejected()
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.optimize({ pattern: null })
      } catch (e) {
        expect(e.message).to.equal('#pattern: keyword is not a string')
      }
    })
  })

  describe('complex string schemas', () => {
    context('with enforced type', () => {
      const schema = { type: 'string', maxLength: 2 }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid value successfully', async () => {
        await expect(assertOptimized('1', schema, assertions)).to.be.fulfilled()
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await expect(assertOptimized(null, schema, assertions)).to.be.rejected()
      })
    })

    context('without enforced type', () => {
      const schema = { maxLength: 2 }

      beforeEach(() => (assertions = AssertString.optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(assertions).to.be.an('array')
        expect(assertions.length).to.equal(1)
        expect(assertions[0]).to.be.a('function')
      })

      it('should assert optimized with valid values successfully', async () => {
        await expect(assertOptimized('1', schema, assertions)).to.be.fulfilled()
        await expect(assertOptimized(null, schema, assertions)).to.be.fulfilled()
      })
    })
  })
})
