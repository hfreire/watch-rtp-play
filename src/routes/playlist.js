/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('joi')
const Boom = require('boom')

const Logger = require('modern-logger')

const HTTPRequest = require('../http-request')

const channels = require('../channels.json')

class Playlist extends Route {
  constructor () {
    super('GET', '/playlist.m3u8', 'Playlist', 'Returns a playlist')
  }

  handler ({ query, headers, info }, reply) {
    const { channel, proxy = false } = query

    if (!channels[ channel ]) {
      reply(Boom.badRequest())

      return
    }

    const host = headers[ 'X-Real-IP' ] || info.host

    const baseUrl = `http://${host}`
    let url
    if (channels[ channel ].is_tv) {
      url = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil/playlist.m3u`
    } else {
      url = `http://streaming-live.rtp.pt/liveradio/${channels[ channel ].name}/playlist.m3u8?DVR`
    }

    const _headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }

    return HTTPRequest.get(url, _headers, proxy)
      .then(({ body }) => {
        if (channels[ channel ].is_tv) {
          body = body.replace(/chunklist_b640000_slpt.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}&bandwidth=640000&proxy=${proxy}`)
          body = body.replace(/chunklist_b340000_slpt.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}&bandwidth=340000&proxy=${proxy}`)
        } else {
          body = body.replace(/chunklist_DVR.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}&proxy=${proxy}`)
        }

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
          .description('the channel'),
        proxy: Joi.string()
          .optional()
          .description('use proxy')
      }
    }
  }

  cors () {
    return {
      origin: [ '*' ]
    }
  }
}

module.exports = new Playlist()
