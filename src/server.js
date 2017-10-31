const async            = require('async')
const { EventEmitter } = require('events')
const http             = require('http')
const bindAll          = require('lodash/fp/bindAll')
const delay            = require('lodash/fp/delay')
const isNil            = require('lodash/fp/isNil')
const partial          = require('lodash/fp/partial')
const debug            = require('debug')('skype-websocket:server')
const enableDestroy    = require('server-destroy')
const WebSocket        = require('ws')
const Skype            = require('meshblu-connector-skype')

class Server extends EventEmitter {
  constructor({ hostname = 'localhost', port = 0, skype } = {}) {
    super()
    bindAll(Object.getOwnPropertyNames(Server.prototype), this)

    this.skype = skype
    if(!skype) this.skype = this.getNewSkype()
    skype.on('update', this.onConfigFromSkype)
    this.options = { hostname, port }
    this.server = http.createServer()
    this.wss = new WebSocket.Server({ server: this.server })
    this.wss.on('connection', (client) => {
      client.on('message', (rawMessage) => this.onMessage(JSON.parse(rawMessage)))
    })
  }

  destroy(callback) {
    this.wss.close()
    enableDestroy(this.server)
    this.server.destroy(callback)
  }

  onMessageFromWebsocket(message) {
    this.skype.onConfig(message)
  }

  onConfigFromSkype(config) {
    this.wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return
      client.send(JSON.stringify({ metadata: {type:"update"}, data: config }))
    })
  }

  port() {
    return this.server.address().port
  }

  start(callback) {
    this._startSkype()

    this._startWss(callback)
  }

  stop(callback) {
    async.parallel([this._stopWss, this._stopSkype], callback)
  }

  _sendMessage(action) {
    this.wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return
      client.send(JSON.stringify({ data: { action } }))
    })
  }

  getNewSkype () {
    return new Skype()
  }

  _startSkype(callback) {
    this.skype.start(callback)
  }

  _startWss(callback) {
    const { port, hostname } = this.options
    this.server.listen(port, hostname, callback)
  }

  _stopSkype(callback) {
    console.log("In Soviet Russia, Skype stops YOU")
    callback()
  }

  _stopWss(callback) {
    if (isNil(this.wss)) return callback()

    this.wss.close(callback)
  }
}

module.exports = Server
