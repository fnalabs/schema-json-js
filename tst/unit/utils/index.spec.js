/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import nock from 'nock'

import { getSchema } from '../../../src/utils'

chai.use(dirtyChai)

describe('getSchema', () => {
  let endpoint

  after(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  afterEach(() => {
    endpoint = null
  })

  context('from http endpoints', () => {
    beforeEach(() => {
      nock.cleanAll()
      nock.disableNetConnect()

      endpoint = nock('http://test.com')
        .get('/folder/schema.json')
        .reply(200, {})
    })

    it('should request the schema successfully', async () => {
      expect(await getSchema('http://test.com/folder/schema.json', false)).to.deep.equal({})
      expect(endpoint.isDone()).to.be.true()
    })
  })

  context('from https endpoints', () => {
    beforeEach(() => {
      nock.cleanAll()
      nock.disableNetConnect()

      endpoint = nock('https://test.com')
        .get('/folder/schema.json')
        .reply(200, {})
    })

    it('should request the schema successfully', async () => {
      expect(await getSchema('https://test.com/folder/schema.json')).to.deep.equal({})
      expect(endpoint.isDone()).to.be.true()
    })
  })

  context('from endpoints that cause errors', () => {
    beforeEach(() => {
      nock.cleanAll()
      nock.disableNetConnect()
    })

    it('should refuse to request anything other than a string', async () => {
      endpoint = nock('https://test.com')
        .get('/folder/schema.json')
        .reply(200, {})

      try {
        await getSchema(null)
      } catch (e) {
        expect(e.message).to.equal('#getSchema: url must be a string')
        expect(endpoint.isDone()).to.be.false()
      }
    })

    it('should expect to catch an error on 500 status code', async () => {
      endpoint = nock('https://test.com')
        .get('/folder/schema.json')
        .reply(500, {})

      try {
        await getSchema('https://test.com/folder/schema.json')
      } catch (e) {
        expect(e.message).to.equal('Request Failed.\nStatus Code: 500')
        expect(endpoint.isDone()).to.be.true()
      }
    })

    it('should expect to catch an error on 500 status code', async () => {
      endpoint = nock('https://test.com')
        .get('/folder/schema.json')
        .reply(200, undefined)

      try {
        await getSchema('https://test.com/folder/schema.json')
      } catch (e) {
        expect(e.message).to.equal('Invalid content-type.\nExpected application/json but received undefined')
        expect(endpoint.isDone()).to.be.true()
      }
    })
  })
})
