/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */

const { afterEach, beforeEach, describe, it } = global
const { expect } = require('chai')
const { EventEmitter } = require('events')
const once = require('lodash/fp/once')
const url = require('url')
const WebSocket = require('ws')
const Server = require('../..')
const sinon = require('sinon')

describe('Server', function() {
  describe('when started', function() {
    beforeEach(function(done) {
      this.skype = {
        start: sinon.stub(),
        onMessage: sinon.stub(),
      }
      this.sut = new Server({ hostname: 'localhost', port: 0, skype: this.skype })
      this.sut.start(done)
    })

    afterEach(function(done) {
      this.sut.destroy(done)
    })

    beforeEach('connect to the WebSocket server', function(done) {
      this.ws = new WebSocket(url.format({
        protocol: 'http',
        hostname: 'localhost',
        port: this.sut.port(),
      }))

      const doneOnce = once(done)
      this.ws.once('open', doneOnce)
      this.ws.once('error', doneOnce)
    })

    describe('when the the websocket server receives a message', function() {
      beforeEach(function(done) {
        this.message = {
          metadata: {
            jobType: 'start-skype'
          }
        }
        this.ws.send(JSON.stringify(this.message))
        setTimeout(done, 500)
      })

      it('should pass that message to the skype library', function() {
          expect(this.skype.onMessage).to.have.been.calledWith(this.message)
      })
    })
  })
})
