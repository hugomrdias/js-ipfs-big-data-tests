
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const randomStream = require('iso-random-stream')
const assert = require('assert')
const ipfsAPI = require('ipfs-api')
const pull = require('pull-stream')

const SIZE = Math.round(Number(process.env.BD_SIZE))

describe('api', function () {
  const Api = ipfsAPI('localhost', process.env.BD_PORT)
  this.timeout(0)

  it('api-add', (done) => {
    Api.add(randomStream(SIZE), function (err, files) {
      if (err) {
        return console.error(err)
      }

      assert.ok(files[0].size > SIZE)
      done()
    })
    done()
  })

  it('api-cat-normal', (done) => {
    Api.cat(process.env.BD_HASH, function (err, files) {
      if (err) {
        return console.error(err)
      }

      assert.ok(files.length === SIZE)
      done()
    })
  })

  it('api-cat-readable-stream', (done) => {
    const stream = Api.catReadableStream(process.env.BD_HASH)
    let size = 0

    stream.on('data', c => {
      size += c.length
    })
    stream.on('end', c => {
      assert.ok(size === SIZE)
      done()
    })
  })

  it('api-cat-pull-stream', (done) => {
    const stream = Api.catPullStream(process.env.BD_HASH)
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
