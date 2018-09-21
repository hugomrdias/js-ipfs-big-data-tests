
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const randomStream = require('iso-random-stream')
const assert = require('assert')
const ipfsAPI = require('ipfs-api')

const SIZE = Math.round(Number(process.env.BD_SIZE))

describe('api-daemon add', function () {
  this.timeout(0)
  it('add', (done) => {
    const Api = ipfsAPI('localhost', process.env.BD_PORT)
    Api.add(randomStream(SIZE), function (err, files) {
      if (err) {
        return console.error(err)
      }

      console.log(files[0].hash)
      assert.ok(files[0].size > SIZE)
      done()
    })
  })
})
