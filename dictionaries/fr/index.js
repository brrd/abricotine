const fs = require('fs')
const path = require('path')

module.exports = load

function load(callback) {
  let result = {}
  let pos = -1
  let exception

  one('aff')
  one('dic')

  function one(name) {
    fs.readFile(path.join(__dirname, 'index.' + name), (error, doc) => {
      pos++
      exception = exception || error
      result[name] = doc

      if (pos) {
        callback(exception, exception ? undefined : result)
        exception = undefined
        result = undefined
      }
    })
  }
}
