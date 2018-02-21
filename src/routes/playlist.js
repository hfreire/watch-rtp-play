/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('joi')
const Boom = require('boom')

const Logger = require('modern-logger')

const Request = require('../rtp-play-request')

const channels = require('../channels.json')

class Playlist extends Route {
  constructor () {
    super('GET', '/playlist.m3u8', 'Playlist', 'Returns a playlist')
  }

  handler ({ query, headers, info, connection }, reply) {
    const { channel, proxy = false } = query

    if (!channels[ channel ]) {
      reply(Boom.badRequest())

      return
    }

    const host = info.host
    const proto = headers[ 'x-forwarded-proto' ] || connection.info.protocol

    const baseUrl = `${proto}://${host}`
    let url
    if (channels[ channel ].is_tv) {
      url = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil/playlist.m3u`
    } else {
      url = `http://streaming-live.rtp.pt/liveradio/${channels[ channel ].name}/playlist.m3u8?DVR`
    }

    const _headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }

    const options = { url, headers: _headers, tor: proxy }

    return Request.get(options)
      .then(({ body }) => {
        if (channels[ channel ].is_tv) {
          body = body.replace(/chunklist_b(\d+)_slpt.m3u8/g, `${baseUrl}/chunklist.m3u8?channel=${channel}&bandwidth=$1&proxy=${proxy}`)
        } else {
          body = body.replace(/chunklist_DVR.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}&proxy=${proxy}`)
        }

        reply(null, body)
      })
      .catch((error) => {
        Logger.error(error)

        reply(Boom.badImplementation(error))
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
