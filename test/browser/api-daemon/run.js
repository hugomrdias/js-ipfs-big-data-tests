#! /usr/bin/env node

'use strict'
const execa = require('execa')
const path = require('path')
const signalExit = require('signal-exit')
const mkdir = require('mkdirp')
const del = require('del')
const meow = require('meow')

const BASE_FOLDER = process.env.BD_BASE_FOLDER || path.join(process.cwd(), './repos/browser')
const BROWSERS = process.env.BD_BROWSERS || 'Chrome'
const EXEC_TYPE = process.env.BD_EXEC_TYPE || 'js'
const SIZE = Math.round(Number(process.env.BD_SIZE)) || 1 * 1000 * 1000

const cliDaemon = async (file = 'ipfs') => {
  mkdir.sync(BASE_FOLDER)
  const options = {env: { IPFS_PATH: `${BASE_FOLDER}/repo-${new Date(Date.now()).toISOString()}` }}

  await execa(file, ['init'], options)

  return new Promise((resolve, reject) => {
    const daemonProc = execa(file, ['daemon'], options)
    const out = daemonProc.stdout
    const err = daemonProc.stderr

    out.on('data', async (chunk) => {
      if (chunk.toString().includes('Daemon is ready')) {
        await execa(file, ['config', '--json', 'API.HTTPHeaders.Access-Control-Allow-Origin', '["http://localhost:9876"]'])
        await execa(file, ['config', '--json', 'API.HTTPHeaders.Access-Control-Allow-Methods', '["PUT", "POST", "GET"]'])
        await execa(file, ['config', '--json', 'API.HTTPHeaders.Access-Control-Allow-Credentials', '["true"]'])
        resolve([daemonProc])
      }
    })

    err.on('data', (chunk) => {
      console.log('Daemon error output:')
      console.log(chunk.toString())
    })
  })
}

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

// Start daemon and karma
cliDaemon(EXEC_TYPE === 'js' ? './node_modules/ipfs/src/cli/bin.js' : './node_modules/go-ipfs-dep/go-ipfs/ipfs')
  .then(daemon => {
    console.log('Starting Karma')
    execa(
      'karma',
      ['start', path.join(__dirname, 'karma.js'), '--browsers', BROWSERS],
      {
        env: {
          BD_PORT: EXEC_TYPE === 'js' ? '5002' : '5001',
          BD_SIZE: SIZE,
          ARGV_FGREP: cli.flags.fgrep
        }
      }
    ).stdout.pipe(process.stdout)
  })
  .catch(err => console.error(err))

// Clean on exit
signalExit(() => {
  del.sync([BASE_FOLDER])
  console.log('\nClean up and exit')
})
