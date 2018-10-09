/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { readFileSync } = require('fs')
const { join } = require('path')

describe('Playlist', () => {
  let subject
  let serverful
  let Joi
  let Boom
  let Request
  let Logger

  beforeAll(() => {
    serverful = td.object([])
    serverful.Route = td.constructor([])
    serverful.Route.BASE_PATH = '/'

    Joi = td.object([ 'string', 'number', 'boolean' ])

    Boom = td.object([ 'badImplementation', 'badRequest' ])

    Request = td.object([ 'get' ])

    Logger = td.object([ 'error' ])
  })

  afterEach(() => td.reset())

  describe('when handling a request for a TV playlist', () => {
    const channel = 'my-channel'
    const url = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil/playlist.m3u`
    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const server = { info: { protocol: 'http' } }
    const info = { host }
    const request = { query, headers: {}, info, server }
    const options = { url, headers, tor: proxy }
    const playlistResponse = { body: readFileSync(join(__dirname, './tv-playlist-response-ok.m3u8')).toString() }
    let h
    let channels

    beforeAll(() => {
      h = td.function()

      channels = td.object([ channel ])
      channels[ channel ] = { is_tv: true }
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/channels.json', channels)

      td.replace('../../src/rtp-play-request', Request)
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenResolve(playlistResponse)

      subject = require('../../src/routes/playlist')
    })

    it('should call request get', async () => {
      await subject.handler(request, h)

      td.verify(Request.get(options), { times: 1 })
    })

    it('should return a modified playlist', async () => {
      const body = readFileSync(join(__dirname, './modified-tv-playlist.m3u8')).toString()

      const result = await subject.handler(request, h)

      expect(result).toEqual(body)
    })
  })

  describe('when handling a request for a radio playlist', () => {
    const channel = 'my-channel'
    const channelName = 'my-channel-name'
    const url = `http://streaming-live.rtp.pt/liveradio/${channelName}/playlist.m3u8?DVR`
    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const server = { info: { protocol: 'http' } }
    const info = { host }
    const request = { query, headers: {}, info, server }
    const options = { url, headers, tor: proxy }
    const playlistResponse = { body: readFileSync(join(__dirname, './radio-playlist-response-ok.m3u8')).toString() }
    let reply
    let channels

    beforeAll(() => {
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
      td.when(Request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenResolve(playlistResponse)

      subject = require('../../src/routes/playlist')
    })

    it('should call request get', async () => {
      await subject.handler(request, reply)

      td.verify(Request.get(options), { times: 1 })
    })

    it('should return a modified playlist', async () => {
      const body = readFileSync(join(__dirname, './modified-radio-playlist.m3u8')).toString()

      const result = await subject.handler(request, reply)

      expect(result).toEqual(body)
    })
  })

  describe('when handling a request that fails while downloading playlist ', () => {
    const channel = 'my-channel'
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const server = { info: { protocol: 'http' } }
    const info = { host }
    const request = { query, headers: {}, info, server }
    const error = new Error('my-message')
    let h
    let channels

    beforeAll(() => {
      h = td.function()

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

      subject = require('../../src/routes/playlist')
    })

    it('should call boom bad request', async () => {
      try {
        await subject.handler(request, h)
      } catch (thrown) {
        expect(thrown).toEqual(error)
      }
    })
  })

  describe('when handling a request for a playlist that does not exist', () => {
    const channel = 'my-channel'
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, headers: {}, info }
    let h
    let channels

    beforeAll(() => {
      h = td.function()

      channels = td.object([])
    })

    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/channels.json', channels)

      td.replace('../../src/rtp-play-request', Request)

      subject = require('../../src/routes/playlist')
    })

    it('should call boom bad request', async () => {
      try {
        await subject.handler(request, h)
      } catch (ignored) {}

      td.verify(Boom.badRequest(), { ignoreExtraArgs: true, times: 1 })
    })
  })

  describe('when configuring validate', () => {
    let type

    beforeAll(() => {
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

      subject = require('../../src/routes/playlist')
    })

    it('should validate query params', () => {
      const result = subject.validate()

      expect(result).toHaveProperty('query')
      expect(result.query).toHaveProperty('channel')
      expect(result.query).toHaveProperty('proxy')
    })
  })

  describe('when configuring cors', () => {
    beforeEach(() => {
      td.replace('serverful', serverful)

      td.replace('joi', Joi)

      td.replace('boom', Boom)

      td.replace('../../src/rtp-play-request', Request)

      subject = require('../../src/routes/playlist')
    })

    it('should allow any origin', () => {
      const result = subject.cors()

      expect(result).toHaveProperty('origin')
      expect(result.origin).toContain('*')
    })
  })
})
