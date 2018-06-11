/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { readFileSync } = require('fs')
const { join } = require('path')

describe('Chunklist', () => {
  let subject
  let serverful
  let Joi
  let Boom
  let Request
  let Logger

  before(() => {
    serverful = td.object([])
    serverful.Route = td.constructor([])

    Joi = td.object([ 'string', 'number', 'boolean' ])

    Boom = td.object([ 'badImplementation', 'badRequest' ])

    Request = td.object([ 'get' ])

    Logger = td.object([ 'error' ])
  })

  afterEach(() => td.reset())

  describe('when handling a request for a TV chunklist', () => {
    const channel = 'my-channel'
    const bandwidth = 640000
    const url = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil/chunklist_b${bandwidth}_slpt.m3u8`
    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const options = { url, headers, tor: proxy }
    const chunklistResponse = { body: readFileSync(join(__dirname, './tv-chunklist-response-ok.m3u8')).toString() }
    let reply
    let channels

    before(() => {
      reply = td.function()

      channels = td.object([ channel ])
      channels[ channel ] = { is_tv: true }
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/channels.json', channels)

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
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const error = new Error('my-message')
    let reply
    let channels

    before(() => {
      reply = td.function()

      channels = td.object([ channel ])
      channels[ channel ] = { is_tv: true }
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/channels.json', channels)

      td.replace('../../src/rtp-play-request', Request)
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenReject(error)

      td.replace('modern-logger', Logger)

      subject = require('../../src/routes/chunklist')
    })

    it('should call boom bad implementation', () => {
      return subject.handler(request, reply)
        .then(() => {
          td.verify(Boom.badImplementation(error), { times: 1 })
        })
    })
  })

  describe('when handling a request for a radio chunklist', () => {
    const channel = 'my-channel'
    const channelName = 'my-channel-name'
    const url = `http://streaming-live.rtp.pt/liveradio/${channelName}/chunklist_DVR.m3u8`
    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const options = { url, headers, tor: proxy }
    const chunklistResponse = { body: readFileSync(join(__dirname, './radio-chunklist-response-ok.m3u8')).toString() }
    let reply
    let channels

    before(() => {
      reply = td.function()

      channels = td.object([ channel ])
      channels[ channel ] = { is_tv: false, name: channelName }
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/channels.json', channels)

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
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const error = new Error('my-message')
    let reply
    let channels

    before(() => {
      reply = td.function()

      channels = td.object([ channel ])
      channels[ channel ] = { is_tv: false }
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/channels.json', channels)

      td.replace('../../src/rtp-play-request', Request)
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenReject(error)

      td.replace('modern-logger', Logger)

      subject = require('../../src/routes/chunklist')
    })

    it('should call boom bad implementation', () => {
      return subject.handler(request, reply)
        .then(() => {
          td.verify(Boom.badImplementation(error), { times: 1 })
        })
    })
  })

  describe('when handling a request for a chunklist that does not exist', () => {
    const channel = 'my-channel'
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    let reply
    let channels

    before(() => {
      reply = td.function()

      channels = td.object([])
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/channels.json', channels)

      td.replace('../../src/rtp-play-request', Request)

      subject = require('../../src/routes/chunklist')
    })

    it('should call boom bad implementation', () => {
      subject.handler(request, reply)

      td.verify(Boom.badRequest(), { times: 1 })
    })
  })

  describe('when configuring validate', () => {
    let type

    before(() => {
      type = td.object([ 'required', 'optional', 'description' ])
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)
      td.when(Joi.string()).thenReturn(type)
      td.when(Joi.number()).thenReturn(type)
      td.when(Joi.boolean()).thenReturn(type)
      td.when(type.required()).thenReturn(type)
      td.when(type.optional()).thenReturn(type)

      td.replace('boom', Boom)

      td.replace('../../src/rtp-play-request', Request)

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

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/rtp-play-request', Request)

      subject = require('../../src/routes/chunklist')
    })

    it('should allow any origin', () => {
      const result = subject.cors()

      result.should.have.property('origin')
      result.origin.should.include('*')
    })
  })
})
