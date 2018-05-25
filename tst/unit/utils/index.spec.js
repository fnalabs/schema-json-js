/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import nock from 'nock'

import { getSchema } from '../../../src/utils'
import draft04Schema from '../../refs/json-schema-draft-04.json'

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

      endpoint = nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, draft04Schema)
    })

    it('should request the schema successfully', async () => {
      expect(await getSchema('http://json-schema.org/draft-04/schema', false)).to.deep.equal(draft04Schema)
    })
  })

  // TODO fix this
  // context('from https endpoints', () => {
  //   beforeEach(() => {
  //     nock.cleanAll()
  //     nock.disableNetConnect()
  //
  //     endpoint = nock('https://json-schema.org')
  //       .get('/draft-04/schema')
  //       .reply(200, draft04Schema)
  //   })
  //
  //   it('should request the schema successfully', async () => {
  //     expect(await getSchema('https://json-schema.org/draft-04/schema')).to.deep.equal(draft04Schema)
  //     expect(endpoint.isDone()).to.be.true()
  //   })
  // })

  context('from endpoints that cause errors', () => {
    beforeEach(() => {
      nock.cleanAll()
      nock.disableNetConnect()
    })

    it('should refuse to request anything other than a string', async () => {
      endpoint = nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, {})

      try {
        await getSchema(null)
      } catch (e) {
        expect(e.message).to.equal('#getSchema: url must be a string')
        expect(endpoint.isDone()).to.be.false()
      }
    })

    it('should expect to catch an error on 500 status code', async () => {
      endpoint = nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(500, {})

      try {
        await getSchema('http://json-schema.org/draft-04/schema', false)
      } catch (e) {
        expect(e.message).to.equal('Request Failed.\nStatus Code: 500')
        expect(endpoint.isDone()).to.be.true()
      }
    })

    it('should expect to catch an error on 500 status code', async () => {
      endpoint = nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, undefined)

      try {
        await getSchema('http://json-schema.org/draft-04/schema', false)
      } catch (e) {
        expect(e.message).to.equal('Invalid content-type.\nExpected application/json but received undefined')
        expect(endpoint.isDone()).to.be.true()
      }
    })
  })
})
