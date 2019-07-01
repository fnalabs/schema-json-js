/* eslint-env mocha */
import nock from 'nock'
import { getTests, runTests } from '../utils'

import draft04Schema from '../refs/json-schema-draft-04.json'
import integerSchema from '../JSON-Schema-Test-Suite/remotes/integer.json'
import subSchema from '../JSON-Schema-Test-Suite/remotes/subSchemas.json'
import nameSchema from '../JSON-Schema-Test-Suite/remotes/name.json'
import folderSchema from '../JSON-Schema-Test-Suite/remotes/folder/folderInteger.json'

describe('functional tests for draft-04 specification', async () => {
  const draft4Tests = await getTests('./tst/JSON-Schema-Test-Suite/tests/draft4')

  after(() => (nock.enableNetConnect()))

  afterEach(() => (nock.cleanAll()))

  before(() => (nock.disableNetConnect()))

  beforeEach(() => {
    nock('http://json-schema.org')
      .get('/draft-04/schema')
      .reply(200, draft04Schema)

    nock('http://localhost:1234')
      .get('/integer.json')
      .reply(200, integerSchema)
      .get('/subSchemas.json')
      .reply(200, subSchema)
      .get('/name.json')
      .reply(200, nameSchema)
      .get('/folder/folderInteger.json')
      .reply(200, folderSchema)
  })

  await runTests(draft4Tests)
})
