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
    console.error("Bad news: You're using the fake. #blamejade")
    console.log('onMessage', JSON.stringify(message, null, 2))
  }
  on () {
    console.error("Bad news: You're using the fake. #blamejade")
  }
}

module.exports = FakeSkype
