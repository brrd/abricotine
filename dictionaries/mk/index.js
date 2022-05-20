const read = require('fs').readFile
const join = require('path').join

module.exports = load

function load(callback) {
  let pos = -1
  let exception = null
  let result = {}

  one('aff')
  one('dic')

  function one(name) {
    read(join(__dirname, 'index.' + name), (error, doc) => {
      pos++
      exception = exception || error
      result[name] = doc

      if (pos) {
        callback(exception, exception ? null : result)
        exception = null
        result = null
      }
    })
  }
}
