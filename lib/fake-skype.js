const bindAll = require('lodash/fp/bindAll')
class FakeSkype {
  constructor () {
    bindAll(Object.getOwnPropertyNames(FakeSkype.prototype), this)
  }

  start (callback) {
    console.log('start')
    if(callback) callback()
  }

  onMessage (message) {
    console.log('onMessage', JSON.stringify(message, null, 2))
  }
}

module.exports = FakeSkype
