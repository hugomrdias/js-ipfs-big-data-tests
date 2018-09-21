'use strict'

const execa = require('execa')
const { series, waterfall } = require('async')
const ctl = require('ipfsd-ctl')

const cliDaemon = (file = 'ipfs', repoPath, peer, cmd) => {
  const options = {env: { IPFS_PATH: repoPath }}

  return new Promise((resolve, reject) => {
    const stream = execa(file, ['daemon'], options)
    const out = stream.stdout
    const err = stream.stderr

    out.on('data', async (chunk) => {
      if (chunk.toString().includes('Daemon is ready')) {
        await execa(file, ['swarm', 'connect', peer], options)
        const proc = execa(file, cmd, Object.assign({}, options, {buffer: false}))

        proc.stdout.on('close', () => {
          stream.kill()
        })

        resolve([proc])
      }
    })

    err.on('data', (chunk) => {
      console.log('Daemon error output:')
      console.log(chunk.toString())
    })
  })
}

const cliInit = (file = 'ipfs', repoPath) => {
  return execa(file, ['init'], {env: {IPFS_PATH: repoPath}})
}

const cliSpawn = (file, repoPath, peer, cmd) => {
  return cliInit(file, repoPath)
    .then(({stdout}) => {
      return cliDaemon(file, repoPath, peer, cmd)
    })
}

const ctlSpawn = (options, peer) => {
  return new Promise((resolve, reject) => {
    const f = ctl.create(options)

    waterfall([
      (cb) => f.spawn({
        disposable: false,
        repoPath: getRepoPath(peer ? 'get' : 'add', options.type)
      }, cb),
      (ipfsd, cb) => ipfsd.init((err) => {
        if (err) { return cb(err) }
        cb(null, ipfsd)
      }),
      (ipfsd, cb) => ipfsd.start((err) => {
        if (err) { return cb(err) }
        cb(null, ipfsd)
      })
    ], (err, ipfsd) => {
      if (err) {
        return reject(err)
      }

      // connect if we get a peer
      if (peer) {
        ipfsd.api.swarm.connect(peer)
          .then(() => {
            resolve(ipfsd)
          })
          .catch(reject)
      } else {
        resolve(ipfsd)
      }
    })
  })
}

const ctlClean = (ipfsd) => {
  return new Promise((resolve, reject) => {
    series([
      cb => ipfsd.stop(cb),
      cb => ipfsd.cleanup(cb)
    ], (err, results) => {
      if (err) { return reject(err) }
      resolve(ipfsd)
    })
  })
}

const getRepoPath = (op, type) => {
  let base = './repos'
  if (op === 'get') {
    base = process.env.BD_GET_PATH || './repos/get'
  }
  if (op === 'add') {
    base = process.env.BD_ADD_PATH || './repos/add'
  }
  return `${base}/repo-${type}-${new Date(Date.now()).toISOString()}`
}

const consumeStream = (stream) => {
  let size = 0
  return new Promise((resolve, reject) => {
    stream.on('data', d => {
      size += d.length
    })

    stream.on('end', () => resolve(size))
    stream.on('error', err => reject(err))
  })
}

module.exports = {
  cliSpawn,
  ctlSpawn,
  ctlClean,
  getRepoPath,
  consumeStream
}
