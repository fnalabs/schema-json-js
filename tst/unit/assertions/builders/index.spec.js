/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import * as builders from '../../../../src/assertions/builders'

chai.use(dirtyChai)

describe('builders', () => {
  const keys = Object.keys(builders)
  let builder

  afterEach(() => (builder = null))

  for (const key of keys) {
    it(`${key} should return its static class if constructed`, () => {
      builder = new builders[key]()

      expect(builder).to.deep.equal(builders[key])
    })
  }
})
