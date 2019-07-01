/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import nock from 'nock'
import sinon from 'sinon'

import { getSchema } from '../../../src/utils'
import draft04Schema from '../../refs/json-schema-draft-04.json'

chai.use(dirtyChai)

describe('getSchema', () => {
  after(() => {
    nock.enableNetConnect()
  })

  before(() => {
    nock.disableNetConnect()
  })

  context('from http endpoints', () => {
    afterEach(() => {
      nock.cleanAll()

      if (global.fetch) global.fetch.restore()
    })

    beforeEach(() => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, draft04Schema)

      if (global.fetch) {
        sinon.stub(global, 'fetch').callsFake(async () => Promise.resolve({ json: () => draft04Schema }))
      }
    })

    it('should request the schema successfully', async () => {
      expect(await getSchema('http://json-schema.org/draft-04/schema', false)).to.deep.equal(draft04Schema)
    })
  })

  context('from https endpoints', () => {
    afterEach(() => {
      nock.cleanAll()

      if (global.fetch) global.fetch.restore()
    })

    beforeEach(() => {
      nock('https://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, draft04Schema)

      if (global.fetch) {
        sinon.stub(global, 'fetch').callsFake(async () => Promise.resolve({ json: () => draft04Schema }))
      }
    })

    it('should request the schema successfully', async () => {
      expect(await getSchema('https://json-schema.org/draft-04/schema')).to.deep.equal(draft04Schema)
    })
  })

  context('from endpoints that cause errors', () => {
    afterEach(() => {
      nock.cleanAll()

      if (global.fetch) global.fetch.restore()
    })

    it('should refuse to request anything other than a string', async () => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, {})

      if (global.fetch) {
        sinon.stub(global, 'fetch').callsFake(async () => Promise.resolve({ json: () => ({}) }))
      }

      try {
        await getSchema(null)
      } catch (e) {
        expect(e.message).to.equal('#getSchema: url must be a string')
      }
    })

    // TODO: double check this is working right
    it('should expect to catch an error on 500 status code', async () => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(500, {})

      if (global.fetch) {
        sinon.stub(global, 'fetch').callsFake(async () => Promise.resolve({
          json: () => {
            throw new Error('Request Failed.\nStatus Code: 500')
          }
        }))
      }

      try {
        await getSchema('http://json-schema.org/draft-04/schema', false)
      } catch (e) {
        expect(e.message).to.equal('Request Failed.\nStatus Code: 500')
      }
    })

    it('should expect to catch an error on invalid content type', async () => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, undefined)

      if (global.fetch) {
        sinon.stub(global, 'fetch').callsFake(async () => Promise.resolve({ json: () => undefined }))
      }

      try {
        await getSchema('http://json-schema.org/draft-04/schema', false)
      } catch (e) {
        expect(e.message).to.equal('Invalid content-type.\nExpected application/json but received undefined')
      }
    })
  })
})
