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
  let Request

  beforeEach(() => {
    jest.mock('serverful')

    Request = require('../../src/rtp-play-request')
    jest.mock('../../src/rtp-play-request')

    jest.mock('modern-logger')
  })

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
    let h

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': { is_tv: true } }))

      Request.get.mockImplementation(async () => chunklistResponse)

      subject = require('../../src/routes/chunklist')
    })

    it('should call request get', async () => {
      await subject.handler(request, h)

      expect(Request.get).toHaveBeenCalledTimes(1)
      expect(Request.get).toHaveBeenCalledWith(options)
    })

    it('should return a modified chunklist', async () => {
      const body = readFileSync(join(__dirname, './modified-tv-chunklist.m3u8')).toString()

      const result = await subject.handler(request, h)

      expect(result).toEqual(body)
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
    let h

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': { is_tv: false, name: 'my-channel-name' } }))

      Request.get.mockImplementation(async () => chunklistResponse)

      subject = require('../../src/routes/chunklist')
    })

    it('should call request get', async () => {
      await subject.handler(request, h)

      expect(Request.get).toHaveBeenCalledTimes(1)
      expect(Request.get).toHaveBeenCalledWith(options)
    })

    it('should reply with a modified chunklist', async () => {
      const body = readFileSync(join(__dirname, './modified-radio-chunklist.m3u8')).toString()

      const result = await subject.handler(request, h)

      expect(result).toEqual(body)
    })
  })

  describe('when handling a request that fails while downloading chunklist', () => {
    const channel = 'my-channel'
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const error = new Error('my-message')
    let h

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': { is_tv: true } }))

      Request.get.mockImplementation(async () => { throw error })

      subject = require('../../src/routes/chunklist')
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

  describe('when handling a request for a chunklist that does not exist', () => {
    const channel = 'my-channel'
    const proxy = false
    const query = { channel, proxy }
    const host = 'my-host'
    const info = { host }
    const request = { query, info }
    const error = new Error(`Invalid channel ${channel}`)
    let h

    beforeEach(() => {
      h = jest.fn()

      jest.mock('../../src/channels.json', () => ({ 'my-channel': undefined }))

      subject = require('../../src/routes/chunklist')
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
      subject = require('../../src/routes/chunklist')
    })

    it('should validate query params', () => {
      const result = subject.validate()

      expect(result).toHaveProperty('query')
      expect(result.query).toHaveProperty('channel')
      expect(result.query).toHaveProperty('bandwidth')
      expect(result.query).toHaveProperty('proxy')
    })
  })

  describe('when configuring cors', () => {
    beforeEach(() => {
      subject = require('../../src/routes/chunklist')
    })

    it('should allow any origin', () => {
      const result = subject.cors()

      expect(result).toHaveProperty('origin')
      expect(result.origin).toContain('*')
    })
  })
})
