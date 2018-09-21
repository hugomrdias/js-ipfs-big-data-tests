/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const assert = require('assert')
const randomStream = require('iso-random-stream')
const pbytes = require('pretty-bytes')
const {
  cliSpawn,
  ctlSpawn,
  ctlClean,
  getRepoPath,
  consumeStream
} = require('../utils')

const SIZE = process.env.BG_SIZE ? Number(process.env.BG_SIZE) : 100 * 1024 * 1024

describe('add-js', function () {
  this.timeout(0)
  let addNode = null
  let hash = null
  let peer = null

  before('spawn and add', async function () {
    addNode = await ctlSpawn({ type: 'js' })
    const files = await addNode.api.files.add(randomStream(SIZE))
    const id = await addNode.api.id()
    hash = files[0].hash
    peer = id.addresses[0]

    console.log(`
hash: ${files[0].hash}
size: ${pbytes(SIZE)}
peer : ${peer}
`)
  })

  after('cleanup', async function () {
    await ctlClean(addNode)
  })

  it('get-js-cli', (done) => {
    const tmp = getRepoPath('get', 'jsipfs')
    let size = 0

    cliSpawn('./node_modules/ipfs/src/cli/bin.js', tmp, peer, ['cat', hash])
      .then(([stream]) => {
        const out = stream.stdout
        const err = stream.stderr
        out.on('data', (chunk) => {
          size += chunk.byteLength
        })
        out.on('end', () => {
          assert.equal(size, SIZE)
          done()
        })

        err.on('data', (chunk) => {
          console.log('ERR')
          console.log(chunk.toString())
        })
      })
  })

  it('get-go-cli', (done) => {
    const tmp = getRepoPath('get', 'ipfs')
    let size = 0

    cliSpawn('./node_modules/go-ipfs-dep/go-ipfs/ipfs', tmp, peer, ['cat', hash])
      .then(([stream]) => {
        const out = stream.stdout
        // const err = stream.stderr
        out.on('data', (chunk) => {
          size += chunk.byteLength
        })
        out.on('end', () => {
          assert.equal(size, SIZE)
          done()
        })

        // err.on('data', (chunk) => {
        //   console.log('ERR')
        //   console.log(chunk.toString())
        // })
      })
  })

  it('get-js-ctl', async () => {
    const ipfsd = await ctlSpawn({type: 'js'}, peer)
    const file = ipfsd.api.files.catReadableStream(hash)
    const size = await consumeStream(file)

    assert.equal(size, SIZE)

    await ctlClean(ipfsd)
  })

  it('get-go-ctl', async () => {
    const ipfsd = await ctlSpawn({type: 'go'}, peer)
    const file = ipfsd.api.files.catReadableStream(hash)
    const size = await consumeStream(file)

    assert.equal(size, SIZE)

    await ctlClean(ipfsd)
  })

  it('get-js-proc-ctl', async () => {
    const ipfsd = await ctlSpawn({ type: 'proc', exec: require('ipfs') }, peer)
    const file = ipfsd.api.files.catReadableStream(hash)
    const size = await consumeStream(file)

    assert.equal(size, SIZE)

    await ctlClean(ipfsd)
  })
})
