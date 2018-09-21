'use strict'
const webpack = require('webpack')

module.exports = function (config) {
  config.set({
    basePath: __dirname,
    frameworks: ['mocha'],
    client: {
      mocha: {
        fgrep: process.env.ARGV_FGREP
      }
    },
    files: [
      'karma-entry.js'
    ],
    preprocessors: {
      'karma-entry.js': ['webpack', 'sourcemap']
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development'),
          'process.env.BD_PORT': JSON.stringify(process.env.BD_PORT),
          'process.env.BD_SIZE': JSON.stringify(process.env.BD_SIZE),
          'process.env.BD_HASH': JSON.stringify(process.env.BD_HASH)
        })
      ]
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome', 'Firefox', 'Safari'],
    singleRun: false,
    concurrency: Infinity,
    browserConsoleLogOptions: {level: 'log', terminal: true}
  })
}
