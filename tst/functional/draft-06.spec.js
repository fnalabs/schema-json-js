/* eslint-env mocha */
import nock from 'nock'
// import { getTests, runTests } from '../utils'

import draft04Schema from '../refs/json-schema-draft-04.json'
import draft06Schema from '../refs/json-schema-draft-06.json'
import integerSchema from '../JSON-Schema-Test-Suite/remotes/integer.json'
import subSchema from '../JSON-Schema-Test-Suite/remotes/subSchemas.json'
import nameSchema from '../JSON-Schema-Test-Suite/remotes/name.json'
import folderSchema from '../JSON-Schema-Test-Suite/remotes/folder/folderInteger.json'

describe('functional tests for draft-06 specification', async () => {
  // TODO: fix errors in Schema implementation
  // const draft6Tests = await getTests('./tst/JSON-Schema-Test-Suite/tests/draft6')

  after(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  beforeEach(() => {
    nock.cleanAll()
    nock.disableNetConnect()

    nock('http://json-schema.org')
      .get('/draft-04/schema')
      .reply(200, draft04Schema)
      .get('/draft-06/schema')
      .reply(200, draft06Schema)

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

  // await runTests(draft6Tests)
})
