/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('joi')
const Boom = require('boom')

const Promise = require('bluebird')

const Logger = require('modern-logger')

const RandomUserAgent = require('random-http-useragent')

const headers = { 'User-Agent': RandomUserAgent.get() }

const channels = require('../channels.json')

const { getAsync } = Promise.promisifyAll(require('request').defaults({ headers }))

class Playlist extends Route {
  constructor () {
    super('GET', '/playlist.m3u8', 'Playlist', 'Returns a playlist')
  }

  handler ({ query, info }, reply) {
    const { channel } = query

    if (!channels[ channel ]) {
      reply(Boom.badRequest())

      return
    }

    const { host } = info

    const baseUrl = `http://${host}`
    let url
    if (channels[ channel ].is_tv) {
      url = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil/playlist.m3u`
    } else {
      url = `http://streaming-live.rtp.pt/liveradio/${channels[ channel ].name}/playlist.m3u8?DVR`
    }

    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }

    getAsync({ url, headers })
      .then(({ body }) => {
        body = body.replace(/chunklist_b640000_slpt.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}&bandwidth=640000`)
        body = body.replace(/chunklist_b340000_slpt.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}&bandwidth=340000`)
        body = body.replace(/chunklist_DVR.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}`)

        reply(null, body)
      })
      .catch((error) => {
        Logger.error(error)

        reply(Boom.badImplementation(error.message, error))
      })
  }

  auth () {
    return false
  }

  validate () {
    return {
      query: {
        channel: Joi.string()
          .required()
          .description('the channel')
      }
    }
  }
}

module.exports = new Playlist()
