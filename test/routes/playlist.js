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
  let Request

  beforeEach(() => {
    const { Route } = require('serverful')
    jest.mock('serverful')
    Route.BASE_PATH = '/'

    Request = require('../../src/rtp-play-request')
    jest.mock('../../src/rtp-play-request')

    jest.mock('modern-logger')
  })

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

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': { is_tv: true } }))

      Request.get.mockImplementation(async () => playlistResponse)

      subject = require('../../src/routes/playlist')
    })

    it('should call request get', async () => {
      await subject.handler(request, h)

      expect(Request.get).toHaveBeenCalledTimes(1)
      expect(Request.get).toHaveBeenCalledWith(options)
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
    let h

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': { is_tv: false, name: 'my-channel-name' } }))

      Request.get.mockImplementation(async () => playlistResponse)

      subject = require('../../src/routes/playlist')
    })

    it('should call request get', async () => {
      await subject.handler(request, h)

      expect(Request.get).toHaveBeenCalledTimes(1)
      expect(Request.get).toHaveBeenCalledWith(options)
    })

    it('should return a modified playlist', async () => {
      const body = readFileSync(join(__dirname, './modified-radio-playlist.m3u8')).toString()

      const result = await subject.handler(request, h)

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

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': { is_tv: true } }))

      Request.get.mockRejectedValue(error)

      subject = require('../../src/routes/playlist')
    })

    it('should propagate error', async () => {
      expect.assertions(1)

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
    const error = new Error(`Invalid channel ${channel}`)
    let h

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': undefined }))

      subject = require('../../src/routes/playlist')
    })

    it('should propagate error', async () => {
      expect.assertions(1)

      try {
        await subject.handler(request, h)
      } catch (thrown) {
        expect(thrown).toEqual(error)
      }
    })
  })

  describe('when configuring validate', () => {
    beforeEach(() => {
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
      subject = require('../../src/routes/playlist')
    })

    it('should allow any origin', () => {
      const result = subject.cors()

      expect(result).toHaveProperty('origin')
      expect(result.origin).toContain('*')
    })
  })
})
