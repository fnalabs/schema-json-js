/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import nock from 'nock'

import Schema from '../../src/Schema'

chai.use(dirtyChai)

describe('Schema', () => {
  const testSchema = { $id: 'http://json-schema.org/draft-04/schema', type: 'string' }
  let endpoint, schema

  afterEach(() => {
    endpoint = null
    schema = null
  })

  describe('constructor', () => {
    it('should create a Schema object successfully', async () => {
      schema = await new Schema()

      expect(schema).to.be.an('object')
      expect(schema).to.deep.equal({})
      expect(schema).to.not.be.frozen()

      const symbols = Object.getOwnPropertySymbols(schema)
      expect(schema[symbols[0]]).to.not.be.frozen()
      expect(schema[symbols[1]]).to.not.be.frozen()

      expect(schema.errors).to.deep.equal([])
      expect(schema.assign).to.be.a('function')
      expect(schema.validate).to.be.a('function')
    })
  })

  describe('#validate', () => {
    it('should validate a base schema ({}) successfully', async () => {
      schema = await new Schema()

      expect(schema).to.deep.equal({})
      expect(schema).to.not.be.frozen()

      const symbols = Object.getOwnPropertySymbols(schema)
      expect(schema[symbols[0]]).to.not.be.frozen()
      expect(schema[symbols[1]]).to.not.be.frozen()

      expect(await schema.validate('anything')).to.be.true()
      expect(await schema.validate(1)).to.be.true()
      expect(await schema.validate(1.1)).to.be.true()
      expect(await schema.validate(true)).to.be.true()
      expect(await schema.validate(['an', 'array'])).to.be.true()
      expect(await schema.validate({an: 'object'})).to.be.true()
      expect(await schema.validate(null)).to.be.true()
    })
  })

  describe('#assign', () => {
    it('should assign a base schema and validate successfully', async () => {
      schema = await new Schema({})

      expect(schema).to.deep.equal({})
      expect(schema).to.be.frozen()

      const symbols = Object.getOwnPropertySymbols(schema)
      expect(schema[symbols[0]]).to.not.be.frozen()
      expect(schema[symbols[1]]).to.be.frozen()
      expect(schema[symbols[2]]).to.be.frozen()

      expect(await schema.validate('anything')).to.be.true()
      expect(await schema.validate(1)).to.be.true()
      expect(await schema.validate(1.1)).to.be.true()
      expect(await schema.validate(true)).to.be.true()
      expect(await schema.validate(['an', 'array'])).to.be.true()
      expect(await schema.validate({an: 'object'})).to.be.true()
      expect(await schema.validate(null)).to.be.true()
    })

    it('should assign properties that are objects successfully', async () => {
      const test = { properties: {} }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
      expect(schema).to.be.frozen()
      expect(schema.properties).to.be.frozen()

      const symbols = Object.getOwnPropertySymbols(schema)
      expect(schema[symbols[0]]).to.not.be.frozen()
      expect(schema[symbols[1]]).to.be.frozen()
      expect(schema[symbols[2]]).to.be.frozen()
    })

    it('should assign properties that are arrays successfully', async () => {
      const test = { type: ['boolean', 'null'] }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
      expect(schema).to.be.frozen()
      expect(schema.type).to.be.frozen()

      const symbols = Object.getOwnPropertySymbols(schema)
      expect(schema[symbols[0]]).to.not.be.frozen()
      expect(schema[symbols[1]]).to.be.frozen()
      expect(schema[symbols[2]]).to.be.frozen()

      expect(await schema.validate(false)).to.be.true()
      expect(await schema.validate(null)).to.be.true()
      expect(await schema.validate('')).to.be.false()
    })

    it('should throw an error on non objects', async () => {
      try {
        schema = await new Schema(null)
      } catch (e) {
        expect(e.message).to.equal('JSON Schemas must be an Object at root')
      }
    })
  })

  describe('($)id|$ref keywords', () => {
    after(() => {
      nock.cleanAll()
      nock.enableNetConnect()
    })

    beforeEach(() => {
      nock.cleanAll()
      nock.disableNetConnect()

      endpoint = nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, testSchema)
    })

    it('should assign with simple definitions successfully', async () => {
      const test = { $ref: '#/definitions/test', definitions: { test: {} } }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
      expect(await schema.validate('test')).to.be.true()
    })

    it('should assign with more complex definitions successfully', async () => {
      const test = { $ref: '#/definitions/test', definitions: { test: { type: 'string' } } }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
      expect(await schema.validate('test')).to.be.true()
    })

    it('should assign with even more complex definitions successfully', async () => {
      const test = { $ref: '#/definitions/test', definitions: { test: { $ref: '#/definitions/anything' }, anything: {} } }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
      expect(await schema.validate('test')).to.be.true()
    })

    it('should assign refs from remote sources successfully', async () => {
      const test = { $ref: 'http://json-schema.org/draft-04/schema' }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
    })

    it('should assign with cached ref for recursive schemas successfully', async () => {
      schema = await new Schema(testSchema)

      expect(schema).to.deep.equal(testSchema)
      expect(endpoint.isDone()).to.be.false()
    })

    it('should assign with nested subSchema successfully', async () => {
      const test = { $ref: '#/definitions/testSchema', definitions: { testSchema } }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
    })

    it('should assign with cached refs successfully', async () => {
      const test = { $ref: 'http://json-schema.org/draft-04/schema#' }
      const refs = { 'http://json-schema.org/draft-04/schema': testSchema }
      schema = await new Schema(test, refs)

      expect(schema).to.deep.equal(test)
      expect(endpoint.isDone()).to.be.false()
    })

    it('should assign nested path fragments successfully', async () => {
      const test = { $id: 'http://json-schema.org/', items: { $id: 'draft-04/', items: { $ref: 'schema' } } }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
    })

    it('should assign and validate refs to boolean schemas', async () => {
      const test = { $ref: '#/definitions/bool', definitions: { bool: false } }
      schema = await new Schema(test)

      expect(schema).to.deep.equal(test)
      expect(await schema.validate('foo')).to.be.false()
    })

    it('should throw an error on invalid $ref value', async () => {
      try {
        schema = await new Schema({ $ref: null })
      } catch (e) {
        expect(e.message).to.equal('#$ref: must be a string')
      }
    })

    it('should throw an error on malformed $ref value', async () => {
      try {
        schema = await new Schema({ $ref: 'http://localhos~t:1234/node#something' })
      } catch (e) {
        expect(e.message).to.equal('#$ref: is malformed')
      }
    })
  })

  describe('type keyword', () => {
    it('should throw an error on invalid type', async () => {
      try {
        schema = await new Schema({ type: null })
      } catch (e) {
        expect(e.message).to.equal('#type: must be either a valid type string or list of strings')
      }
    })

    it('should throw an error on invalid type string', async () => {
      try {
        schema = await new Schema({ type: 'steve' })
      } catch (e) {
        expect(e.message).to.equal('#type: \'steve\' is not a valid JSON Schema type')
      }
    })

    it('should throw an error on invalid type array', async () => {
      try {
        schema = await new Schema({ type: [1] })
      } catch (e) {
        expect(e.message).to.equal('#type: type arrays must contain only string')
      }
    })
  })
})
