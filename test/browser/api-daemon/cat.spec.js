
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const randomStream = require('iso-random-stream')
const assert = require('assert')
const ipfsAPI = require('ipfs-api')
const pull = require('pull-stream')

const SIZE = Math.round(Number(process.env.BD_SIZE))

describe('api-daemon cat', function () {
  this.timeout(0)
  const Api = ipfsAPI('localhost', process.env.BD_PORT)
  let hash = null

  before('spawn and add', function (done) {
    Api.add(randomStream(SIZE), function (err, files) {
      if (err) {
        return console.error(err)
      }

      hash = files[0].hash
      console.log(`
  hash: ${files[0].hash}
  size: ${SIZE}
  `)
      done()
    })
  })

  it('cat-normal', (done) => {
    Api.cat(hash, function (err, files) {
      if (err) {
        return console.error(err)
      }
      assert.ok(files.length === SIZE)
      done()
    })
  })

  it('cat-readable-stream', (done) => {
    const stream = Api.catReadableStream(hash)
    let size = 0

    stream.on('data', c => {
      size += c.length
    })
    stream.on('end', c => {
      assert.ok(size === SIZE)
      done()
    })
  })

  it('cat-pull-stream', (done) => {
    const stream = Api.catPullStream(hash)
    let size = 0

    pull(
      stream,
      pull.drain(c => {
        size += c.length
      }, () => {
        assert.ok(size === SIZE)
        done()
      })
    )
  })
})
