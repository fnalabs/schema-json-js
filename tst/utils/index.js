/* eslint-env mocha */
import fs from 'fs'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'

import Schema from '../../src/Schema'

chai.use(dirtyChai)

export async function getTests (dir, filterList = []) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err)

      const tests = []
      for (const file of files) {
        if (file.indexOf('.json') !== -1 && filterList.indexOf(file)) {
          const data = fs.readFileSync(`${dir}/${file}`, 'utf8')
          tests.push(...JSON.parse(data))
        }
      }
      resolve(tests)
    })
  })
}

export async function runTests (tests) {
  for (const testSuite of tests) {
    for (const test of testSuite.tests) {
      it(`${testSuite.description}; ${test.description}`, async () => {
        const schema = await new Schema(testSuite.schema)
        expect(await schema.validate(test.data)).to.equal(test.valid)
      })
    }
  }
}
