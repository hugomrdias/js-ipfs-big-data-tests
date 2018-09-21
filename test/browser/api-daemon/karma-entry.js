// require all modules ending in "_test" from the
// current directory and all subdirectories
'use strict'
const testsContext = require.context('.', true, /spec$/)

testsContext.keys().forEach(testsContext)
