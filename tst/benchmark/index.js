// imports
const path = require('path')
const fs = require('fs')

const _ = require('lodash')
const Benchmark = require('benchmark')
const Mustache = require('mustache')
const hrtime = require('browser-process-hrtime')

const ajv = require('ajv')({ schemaId: 'auto' })
const djv = require('djv')()
const imjv = require('is-my-json-valid')
const Schema = require('../../dist/Schema')
const ZSchema = process.env.TEST_PLATFORM === 'node' ? require('z-schema') : window.ZSchema

const primitiveData = require('./primitive_data.json')
const primitiveSchema = require('./primitive_schema.json')
const standardData = require('./standard_data.json')
const standardSchema = require('./standard_schema.json')
const advancedData = require('./advanced_data.json')
const advancedSchema = require('./advanced_schema.json')

const browserTemplate = `<p><a href="index.html">Home</a></p>
<h1>schema-json-js benchmarks - </h1>
<h2>Hardware</h2>
<p>Run on the following hardware:</p>
<dl>
  <dt>CPU</dt>
  <dd>Intel Core i7-7700K CPU @ 4.20GHz x 8</dd>
  <dt>RAM</dt>
  <dd>G.SKILL TridentZ Series 32GB DDR4 @ 3020 MHz</dd>
  <dt>HDD</dt>
  <dd>Samsung 960 EVO m.2 500GB</dd>
  <dt>OS</dt>
  <dd>Pop! OS 18.04 LTS</dd>
  <dt>Browser</dt>
  <dd>{{platform}}</dd>
</dl>
<h2>Tests</h2>
<p>Generated on {{currentDate}} in {{totalTime}} minutes</p>
<p><strong>NOTE:</strong> Validators marked with an asterisk (*) use code generation (eval and/or new Function) so performance may suffer in serialized use cases. Some of these validators work around it with caching but memory usage may suffer as a result.</p>
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
    <td{{#title}} title="{{title}}"{{/title}}{{#failed}} class="failed"{{/failed}}{{#fastest}} class="fastest"{{/fastest}}>
      {{percentage}}% ({{hz}})
    </td>
    {{/results}}
  </tr>
  {{/results}}
</table>
<ul>
  {{#tests}}
  <li>
    {{name}}
    <ul>
      <li class="green">passed: {{testsPassed}}</li>
      <li{{#testsFailed}} class="red"{{/testsFailed}}>failed: {{testsFailed}}</li>
      <li>times fastest: {{timesFastest}}</li>
    </ul>
  </li>
  {{/tests}}
</ul>`

/**
 * define tests
 */
global.Benchmark = Benchmark
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
djv.useVersion('draft-04')

let start, end
const results = []
const tests = [
  {
    name: 'schema-json-js',
    setup: async (name, schema) => new Schema(schema),
    test: (instance, data) => instance.validate(data),
    serialize: async (name, data, schema) => {
      const instance = await new Schema(schema)
      return instance.validate(data)
    },
    testsPassed: 0,
    testsFailed: 0,
    timesFastest: 0
  },
  {
    name: 'z-schema',
    setup: async () => new ZSchema(),
    test: (instance, data, schema) => instance.validate(data, schema),
    serialize: async (name, data, schema) => {
      const instance = new ZSchema()
      return instance.validate(data, schema)
    },
    testsPassed: 0,
    testsFailed: 0,
    timesFastest: 0
  },
  {
    name: 'ajv*',
    setup: async (name, schema) => ajv.compile(schema),
    test: (instance, data) => instance(data),
    serialize: async (name, data, schema) => {
      const instance = ajv.compile(schema)
      return instance(data)
    },
    testsPassed: 0,
    testsFailed: 0,
    timesFastest: 0
  },
  {
    name: 'djv*',
    setup: async (name, schema) => djv.addSchema(name, schema).fn,
    test: (instance, data) => instance(data) === undefined,
    serialize: async (name, data, schema) => {
      const instance = djv.addSchema(name, schema).fn
      return instance(data) === undefined
    },
    testsPassed: 0,
    testsFailed: 0,
    timesFastest: 0
  },
  {
    name: 'is-my-json-valid*',
    setup: async (name, schema) => imjv(schema),
    test: (instance, data) => instance(data),
    serialize: async (name, data, schema) => {
      const instance = imjv(schema)
      return instance(data)
    },
    testsPassed: 0,
    testsFailed: 0,
    timesFastest: 0
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

  for (const validatorObject of tests) {
    const data = _.cloneDeep(testJson)
    const schema = _.cloneDeep(testSchema)
    let instance
    let givenResult

    try {
      // setup instance
      instance = await validatorObject.setup(testName, schema)
      // verify that validator really works
      givenResult = process.env.TEST_TYPE === 'serialize'
        ? await validatorObject.serialize(testName, data, schema)
        : validatorObject.test(instance, data, schema)
    } catch (e) {
      console.log(e)
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
      if (process.env.TEST_TYPE === 'serialize') {
        suite.add(`${validatorObject.name}#${testName} (build & validate)`, async () => {
          await validatorObject.serialize(testName, data, schema)
        })
      } else {
        suite.add(`${validatorObject.name}#${testName} (validate only)`, () => {
          validatorObject.test(instance, data, schema)
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
      async: false
    })

  console.log('-')

  const suiteResult = {
    name: testName,
    results: []
  }
  let fastest = 0
  let fastestValidator = null
  for (const validatorObject of tests) {
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
      currentDate,
      results,
      tests,
      totalTime: totalTimeInMinutes,
      type: process.env.TEST_TYPE
    })

    fs.writeFileSync(fileName, html)
  } else {
    const html = Mustache.render(browserTemplate, {
      currentDate,
      platform: process.env.TEST_PLATFORM,
      results,
      tests,
      totalTime: totalTimeInMinutes
    })
    document.getElementById('results').innerHTML = html
  }

  console.log(`${process.env.TEST_PLATFORM} benchmark finished on ${currentDate} in ${totalTimeInMinutes} minutes`)
}

/**
 * run tests
 */
(async () => {
  start = hrtime()

  await runOne('primitive data', primitiveData, primitiveSchema, true)
  await runOne('standard data', standardData, standardSchema, true)
  await runOne('advanced data', advancedData, advancedSchema, true)

  saveResults(`../../docs/${process.env.TEST_PLATFORM}.${process.env.TEST_TYPE}.html`, 'results.mustache')
})()
