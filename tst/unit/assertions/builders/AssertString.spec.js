/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import AssertString from '../../../../src/assertions/builders/AssertString'
import { assertOptimized } from '../../../../src/assertions/types'

chai.use(dirtyChai)

describe('AssertString', () => {
  const errors = []
  let assertions

  afterEach(() => {
    errors.length = 0
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
      await assertOptimized('', schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized(null, schema, assertions, errors)
      expect(errors.length).to.equal(1)
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
        await assertOptimized('1963-06-19T08:30:06.283185Z', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('06/19/1963 08:30:06 PST', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('joe.bloggs@example.com', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('2962', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('192.168.0.1', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('127.0', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('::1', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('12345::', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('www.example.com', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('-a-host-name-that-starts-with--', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('/foo/bar~0/baz~1/%a', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('/foo/bar~', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('^a', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('[', schema, assertions, errors)
        expect(errors.length).to.equal(1)
      })

      it('should assert optimized with invalid \\Z anchor value unsuccessfully', async () => {
        await assertOptimized('^\\S(|(.|\\n)*\\S)\\Z', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('http://foo.bar/?baz=qux#quux', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('//foo.bar/?baz=qux#quux', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('/abc', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('\\\\WINDOWS\\fileshare', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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
        await assertOptimized('http://example.com/dictionary/{term:1}/{term}', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized('http://example.com/dictionary/{term:1}/{term', schema, assertions, errors)
        expect(errors.length).to.equal(1)
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

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized('', schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized('1', schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized('12', schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized('\uD83D\uDCA9', schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized('\uD83D\uDCA9\uD83D\uDCA9', schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized('123', schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should assert optimized with invalid utf8 value unsuccessfully', async () => {
      await assertOptimized('\uD83D\uDCA9\uD83D\uDCA9\uD83D\uDCA9', schema, assertions, errors)
      expect(errors.length).to.equal(1)
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

    it('should assert optimized with valid value successfully', async () => {
      await assertOptimized('12', schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized('123', schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized('\uD83D\uDCA9\uD83D\uDCA9', schema, assertions, errors)
      expect(errors.length).to.equal(0)

      await assertOptimized('\uD83D\uDCA9\uD83D\uDCA9\uD83D\uDCA9', schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized('1', schema, assertions, errors)
      expect(errors.length).to.equal(1)
    })

    it('should assert optimized with invalid utf8 value unsuccessfully', async () => {
      await assertOptimized('\uD83D\uDCA9', schema, assertions, errors)
      expect(errors.length).to.equal(1)
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
      await assertOptimized('aaa', schema, assertions, errors)
      expect(errors.length).to.equal(0)
    })

    it('should assert optimized with invalid value unsuccessfully', async () => {
      await assertOptimized('abc', schema, assertions, errors)
      expect(errors.length).to.equal(1)
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
        await assertOptimized('1', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with invalid value unsuccessfully', async () => {
        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(1)
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

      it('should assert optimized with valid value successfully', async () => {
        await assertOptimized('1', schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })

      it('should assert optimized with non-array successfully', async () => {
        await assertOptimized(null, schema, assertions, errors)
        expect(errors.length).to.equal(0)
      })
    })
  })
})
