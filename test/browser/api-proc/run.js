#! /usr/bin/env node

'use strict'
const execa = require('execa')
const path = require('path')
const signalExit = require('signal-exit')
const del = require('del')
const randomStream = require('iso-random-stream')
const IpfsServer = require('ipfs/src/http')
const meow = require('meow')

const BASE_FOLDER = process.env.BD_BASE_FOLDER || path.join(process.cwd(), './repos/browser')
const BROWSERS = process.env.BD_BROWSERS || 'Chrome'
const SIZE = Math.round(Number(process.env.BD_SIZE)) || 1 * 1000 * 1000

const cli = meow(`
  Usage
    $ ./run.js <options>

  Options
    --fgrep, -f  mocha fgrep

  Examples
    $ ./run.js  -f
`, {
  flags: {
    fgrep: {
      type: 'string',
      alias: 'f'
    }
  }
})

const server = new IpfsServer(`${BASE_FOLDER}/repo-${new Date(Date.now()).toISOString()}`, null)

server.start(true, (err) => {
  if (err) {
    throw err
  }
  console.log('Daemon is ready')

  server.node.files.add(randomStream(SIZE))
    .then(files => {
      console.log('Starting Karma')
      const karma = execa(
        'karma',
        ['start', path.join(__dirname, 'karma.js'), '--browsers', BROWSERS],
        {
          env: {
            BD_PORT: '5002',
            BD_HASH: files[0].hash,
            BD_SIZE: SIZE,
            ARGV_FGREP: cli.flags.fgrep
          }
        }
      )
      karma.stdout.pipe(process.stdout)
    })
})

// Clean on exit
signalExit(() => {
  server.stop((err) => {
    if (err) {
      throw err
    }
  })
  del.sync([BASE_FOLDER])
  console.log('\nClean up and exit')
})
