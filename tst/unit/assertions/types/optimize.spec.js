/* eslint-env mocha */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import * as optimize from '../../../../src/assertions/types/optimize'

chai.use(dirtyChai)

describe('optimize assertions', () => {
  it('should assert maximum size keywords successfully', () => {
    expect(optimize.assertSizeMax(1, 'maxItems')).to.be.a('function')

    try {
      optimize.assertSizeMax(0, 'maxItems')
    } catch (e) {
      expect(e.message).to.equal('#maxItems: keyword must be a positive integer')
    }

    try {
      optimize.assertSizeMax(1.1, 'maxItems')
    } catch (e) {
      expect(e.message).to.equal('#maxItems: keyword must be a positive integer')
    }
  })

  it('should assert minimum size keywords successfully', () => {
    expect(optimize.assertSizeMin(1, 'minItems')).to.be.a('function')

    try {
      optimize.assertSizeMin(0, 'minItems')
    } catch (e) {
      expect(e.message).to.equal('#minItems: keyword must be a positive integer')
    }

    try {
      optimize.assertSizeMin(1.1, 'minItems')
    } catch (e) {
      expect(e.message).to.equal('#minItems: keyword must be a positive integer')
    }
  })
})
