# js-ipfs-big-data-tests 

> Big data test harness

## Usage

### Node tests
ENV vars available:

 - `BD_ADD_PATH` - repo path to for the adding ipfs instance
 - `BD_GET_PATH` - repo path to for the getting ipfs instance
 - `BD_SIZE` - number of random bytes to add

```js
// run all tests
yarn test:node

// run one test
yarn test:node --fgrep 'add-js get-js-cli'

// run filtered with grep
yarn test:node --grep 'add*'

//debugging

// with ndb all child process get attached
ndb yarn test:node --fgrep 'add-js get-js-cli'

// with normal --inspect
yarn test:node --fgrep 'add-js get-js-cli' --inspect

// log statistical profiling information
yarn test:node --fgrep 'add-js get-js-cli' --prof

// enable perf linux profiler (basic support)
yarn test:node --fgrep 'add-js get-js-cli' --perf-basic-prof

```
### Use vscode to run mocha in debug mode with a config like this

```json
{
  "type": "node",
  "request": "launch",
  "name": "Mocha Tests",
  "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
  "args": [
    "-u",
    "tdd",
    "--timeout",
    "999999",
    "--colors",
    "${workspaceFolder}/test/node/*.spec.js"
  ],
  "internalConsoleOptions": "openOnSessionStart"
}
```

### Browser tests
ENV vars available:

 - `BD_BASE_FOLDER` - base folder for repos
 - `BD_BROWSERS` - mocha browsers arg
 - `BD_EXEC_TYPE` - daemon type `go` or `js`
 - `BD_SIZE` - number of random bytes to add

```js
// run browser api tests connected to a daemon
yarn test:browser-api-daemon

// run browser api tests connected to in-proc ipfs instance
yarn test:browser-api-proc

// Filter example, only runs the add test
yarn test:browser-api-proc --fgrep 'api api-add'


```
For debugging check node tests, with `ndb` you get a nice setup with 2 devtools, one in the browser and another to node and auto rebuild from karma. 

## TODO

 - [ ] can't run browsers test connect to go ipfs because of cors
 - [x] add cli args to grep and fgrep to browser tests
 - [ ] clean repos for node `get-*-cli`
 - [ ] browser core/service worker tests WIP



## License

MIT © [Hugo Dias](http://hugodias.me)
