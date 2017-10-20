/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { readFileSync } = require('fs')
const { join } = require('path')

describe('Chunklist', () => {
  let subject
  let serverful
  let Request
  let Logger

  before(() => {
    serverful = td.object([])
    serverful.Route = td.constructor([])

    Request = td.object([ 'get' ])

    Logger = td.object([ 'error' ])
  })

  afterEach(() => td.reset())

  describe('when handling a request for a TV chunklist', () => {
    const channel = 'my-channel'
    const bandwidth = 640000
    let channels
    const url = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil/chunklist_b${bandwidth}_slpt.m3u8`
    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const options = { url, headers, tor: proxy }
    let reply
    const chunklistResponse = { body: readFileSync(join(__dirname, './tv-chunklist-response-ok.m3u8')).toString() }

    beforeEach(() => {
      td.replace('serverful', serverful)

      channels = td.object([ channel ])
      td.replace('../../src/channels.json', channels)
      channels[ channel ] = { is_tv: true }

      reply = td.function()

      td.replace('../../src/rtp-play-request', Request)
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenResolve(chunklistResponse)

      subject = require('../../src/routes/chunklist')
    })

    it('should call request get', () => {
      subject.handler(request, reply)

      td.verify(Request.get(options), { times: 1 })
    })

    it('should reply with a modified chunklist', () => {
      const replyBody = readFileSync(join(__dirname, './modified-tv-chunklist.m3u8')).toString()

      return subject.handler(request, reply)
        .then(() => {
          td.verify(reply(null, replyBody), { times: 1 })
        })
    })
  })

  describe('when handling a request that fails for a TV chunklist', () => {
    const channel = 'my-channel'
    let channels
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    let reply
    const error = new Error('my-message')

    beforeEach(() => {
      td.replace('serverful', serverful)

      channels = td.object([ channel ])
      td.replace('../../src/channels.json', channels)
      channels[ channel ] = { is_tv: true }

      reply = td.function()

      td.replace('../../src/rtp-play-request', Request)
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenReject(error)

      td.replace('modern-logger', Logger)

      subject = require('../../src/routes/chunklist')
    })

    it('should return 500', () => {
      return subject.handler(request, reply)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(reply(captor.capture()), { times: 1 })

          const _error = captor.value
          _error.should.have.property('isBoom')
          _error.should.be.instanceOf(Error)
          _error.isBoom.should.be.equal(true)
          _error.message.should.contain(error.message)
          _error.output.statusCode.should.be.equal(500)
        })
    })
  })

  describe('when handling a request for a radio chunklist', () => {
    const channel = 'my-channel'
    const channelName = 'my-channel-name'
    let channels
    const url = `http://streaming-live.rtp.pt/liveradio/${channelName}/chunklist_DVR.m3u8`
    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const options = { url, headers, tor: proxy }
    let reply
    const chunklistResponse = { body: readFileSync(join(__dirname, './radio-chunklist-response-ok.m3u8')).toString() }

    beforeEach(() => {
      td.replace('serverful', serverful)

      channels = td.object([ channel ])
      td.replace('../../src/channels.json', channels)
      channels[ channel ] = { is_tv: false, name: channelName }

      reply = td.function()

      td.replace('../../src/rtp-play-request', Request)
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenResolve(chunklistResponse)

      subject = require('../../src/routes/chunklist')
    })

    it('should call request get', () => {
      subject.handler(request, reply)

      td.verify(Request.get(options), { times: 1 })
    })

    it('should reply with a modified chunklist', () => {
      const replyBody = readFileSync(join(__dirname, './modified-radio-chunklist.m3u8')).toString()

      return subject.handler(request, reply)
        .then(() => {
          td.verify(reply(null, replyBody), { times: 1 })
        })
    })
  })

  describe('when handling a request that fails for a radio chunklist', () => {
    const channel = 'my-channel'
    let channels
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    let reply
    const error = new Error('my-message')

    beforeEach(() => {
      td.replace('serverful', serverful)

      channels = td.object([ channel ])
      td.replace('../../src/channels.json', channels)
      channels[ channel ] = { is_tv: false }

      reply = td.function()

      td.replace('../../src/rtp-play-request', Request)
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenReject(error)

      td.replace('modern-logger', Logger)

      subject = require('../../src/routes/chunklist')
    })

    it('should return 500', () => {
      return subject.handler(request, reply)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(reply(captor.capture()), { times: 1 })

          const _error = captor.value
          _error.should.have.property('isBoom')
          _error.should.be.instanceOf(Error)
          _error.isBoom.should.be.equal(true)
          _error.message.should.contain(error.message)
          _error.output.statusCode.should.be.equal(500)
        })
    })
  })

  describe('when handling a request for a chunklist that does not exist', () => {
    const channel = 'my-channel'
    let channels
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    let reply

    beforeEach(() => {
      td.replace('serverful', serverful)

      channels = td.object([])
      td.replace('../../src/channels.json', channels)

      reply = td.function()

      subject = require('../../src/routes/chunklist')
    })

    it('should return 400', () => {
      subject.handler(request, reply)

      const captor = td.matchers.captor()

      td.verify(reply(captor.capture()), { times: 1 })

      const error = captor.value
      error.should.have.property('isBoom')
      error.should.be.instanceOf(Error)
      error.isBoom.should.be.equal(true)
      error.message.should.contain(error.message)
      error.output.statusCode.should.be.equal(400)
    })
  })

  describe('when configuring authentication', () => {
    beforeEach(() => {
      td.replace('serverful', serverful)

      subject = require('../../src/routes/chunklist')
    })

    it('should not require authenticate', () => {
      const auth = subject.auth()

      auth.should.be.equal(false)
    })
  })

  describe('when configuring validate', () => {
    beforeEach(() => {
      td.replace('serverful', serverful)

      subject = require('../../src/routes/chunklist')
    })

    it('should validate query params', () => {
      const result = subject.validate()

      result.should.have.property('query')
      result.query.should.have.all.keys([ 'channel', 'bandwidth', 'proxy' ])
    })
  })

  describe('when configuring cors', () => {
    beforeEach(() => {
      td.replace('serverful', serverful)

      subject = require('../../src/routes/chunklist')
    })

    it('should allow any origin', () => {
      const result = subject.cors()

      result.should.have.property('origin')
      result.origin.should.include('*')
    })
  })
})
