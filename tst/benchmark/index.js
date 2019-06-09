// imports
const path = require('path')
const fs = require('fs')

const _ = require('lodash')
const Benchmark = require('benchmark')
const Mustache = require('mustache')
const hrtime = require('browser-process-hrtime')

// const jsck = require('jsck')
const Schema = require('../../dist/Schema')
const ZSchema = require('z-schema')

const primitiveData = require('./primitive_data.json')
const primitiveSchema = require('./primitive_schema.json')
const standardData = require('./standard_data.json')
const standardSchema = require('./standard_schema.json')
const advancedData = require('./advanced_data.json')
const advancedSchema = require('./advanced_schema.json')

const browserTemplate = `Generated on {{currentDate}} in {{totalTime}} minutes
<ul>
    {{#tests}}
    <li>
        {{name}}
        <ul>
            <li class="green">passed: {{testsPassed}}</li>
            <li {{#testsFailed}}class="red"{{/testsFailed}}>failed: {{testsFailed}}</li>
            <li>times fastest: {{timesFastest}}</li>
        </ul>
    </li>
    {{/tests}}
</ul>
<table>
    <tr>
        <th></th>
        {{#tests}}
        <th>
            {{name}}
        </th>
        {{/tests}}
    </tr>
    {{#results}}
    <tr>
        <td>{{name}}</td>
        {{#results}}
        <td {{#title}}title="{{title}}"{{/title}}
            {{#failed}}class="failed"{{/failed}}
            {{#fastest}}class="fastest"{{/fastest}}>
            {{percentage}}% ({{hz}})
        </td>
        {{/results}}
    </tr>
    {{/results}}
</table>`

/**
 * define tests
 */
global.Benchmark = Benchmark
let start, end
const results = []
const tests = [
  // {
  //   name: 'jsck',
  //   setup: async (schema) => new jsck.draft4(schema), // eslint-disable-line new-cap
  //   test: (instance, data) => instance.validate(data).valid,
  //   all: async (instance, data, schema) => {
  //     const obj = new jsck.draft4(schema) // eslint-disable-line new-cap
  //     return obj.validate(data).valid
  //   }
  // },
  {
    name: 'schema-json-js',
    setup: async (schema) => new Schema(schema),
    test: (instance, data) => instance.validate(data),
    all: async (instance, data, schema) => {
      const obj = await new Schema(schema)
      return obj.validate(data)
    }
  },
  {
    name: 'z-schema',
    setup: async (schema) => new ZSchema(),
    test: (instance, data, schema) => instance.validate(data, schema),
    all: async (instance, data, schema) => {
      const obj = new ZSchema()
      return obj.validate(data, schema)
    }
  }
]

/**
 * test functions
 */
function isExcluded (name) {
  let retval = true
  let grep = null

  process.argv.forEach((val, index, arr) => {
    if (val === '--grep') {
      grep = arr[index + 1]
      if (name.indexOf(grep) !== -1) {
        retval = false
      }
    }
  })

  return grep ? retval : false
}

async function runOne (testName, testJson, testSchema, expectedResult) {
  if (isExcluded(testName)) return

  const suite = new Benchmark.Suite()
  const fails = {}

  for (let validatorObject of tests) {
    const json = _.cloneDeep(testJson)
    const schema = _.cloneDeep(testSchema)

    // setup instance
    const instance = await validatorObject.setup(schema)
    // verify that validator really works
    let givenResult
    try {
      givenResult = process.env.TEST_TYPE === 'all'
        ? await validatorObject.all(instance, json, schema)
        : validatorObject.test(instance, json, schema)
    } catch (e) {
      fails[validatorObject.name] = e
      givenResult = e
    }
    if (givenResult !== expectedResult) {
      console.warn(`${validatorObject.name} failed the test ${testName}`)
      validatorObject.testsFailed += 1
      if (!fails[validatorObject.name]) {
        fails[validatorObject.name] = `expected was ${expectedResult} but validator returned ${givenResult}`
      }
    } else {
      // add it to benchmark
      if (process.env.TEST_TYPE === 'all') {
        suite.add(`${validatorObject.name}#${testName} (build & validate)`, async () => {
          await validatorObject.all(instance, json, schema)
        })
      } else {
        suite.add(`${validatorObject.name}#${testName} (validate only)`, () => {
          validatorObject.test(instance, json, schema)
        })
      }
      validatorObject.testsPassed += 1
    }
  }

  suite
  // add listeners
    .on('cycle', function (event) {
      console.log(String(event.target))
    })
    .on('complete', function () {
      console.log(`Fastest is ${this.filter('fastest').map('name')}`)
    })
    .run({
      'async': false
    })

  console.log('-')

  const suiteResult = {
    name: testName,
    results: []
  }
  let fastest = 0
  let fastestValidator = null
  for (let validatorObject of tests) {
    let ops
    const results = _.find(suite, obj =>
      validatorObject.name === obj.name.substring(0, obj.name.indexOf('#')))

    if (results) {
      ops = parseInt(results.hz, 10)
      suiteResult.results.push({
        hz: ops
      })
    } else {
      ops = -1
      suiteResult.results.push({
        hz: ops,
        failed: true,
        title: fails[validatorObject.name].toString()
      })
    }
    if (ops > fastest) {
      fastest = ops
      fastestValidator = validatorObject
    }
  }

  if (fastestValidator) { // if all fail, no-one is the fastest
    fastestValidator.timesFastest += 1
  }
  suiteResult.results.forEach(function (result) {
    if (result.hz === fastest) {
      result.fastest = true
    }
    result.percentage = parseInt(result.hz / fastest * 100, 10)
    if (Number.isNaN(result.percentage)) { result.percentage = 0 }
  })
  results.push(suiteResult)
}

function saveResults (fileName, templateName) {
  end = hrtime()
  let totalTimeInMinutes = ((end[0] - start[0]) / 60)
  totalTimeInMinutes = parseInt(totalTimeInMinutes * 100, 10) / 100
  const currentDate = new Date().toLocaleDateString()

  if (process.env.TEST_PLATFORM === 'node') {
    fileName = [__dirname, fileName].join(path.sep)

    const template = fs.readFileSync([__dirname, templateName].join(path.sep)).toString()
    const html = Mustache.render(template, {
      tests,
      results,
      currentDate,
      totalTime: totalTimeInMinutes
    })

    fs.writeFileSync(fileName, html)
  } else {
    const html = Mustache.render(browserTemplate, {
      tests,
      results,
      currentDate,
      totalTime: totalTimeInMinutes
    })

    document.body.innerHTML = html
  }

  console.log(`${fileName} created on ${currentDate} in ${totalTimeInMinutes} minutes`)
}

/**
 * run tests
 */
(async () => {
  start = hrtime()

  await runOne('primitive data', primitiveData, primitiveSchema, true)
  await runOne('standard data', standardData, standardSchema, true)
  await runOne('advanced data', advancedData, advancedSchema, true)

  saveResults(`results/${process.env.TEST_PLATFORM}.${process.env.TEST_TYPE}.html`, 'results.mustache')
})()
