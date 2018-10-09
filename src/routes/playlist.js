/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const _ = require('lodash')

const Joi = require('joi')
const Boom = require('boom')

const Request = require('../rtp-play-request')

const channels = require('../channels.json')

class Playlist extends Route {
  constructor () {
    super('GET', '/playlist.m3u8', 'Playlist', 'Returns a playlist')
  }

  async handler ({ query, headers, server, info }, h) {
    const { channel, proxy = false } = query

    if (!channels[ channel ]) {
      throw Boom.badRequest(`Invalid channel ${channel}`)
    }

    const host = _.get(headers, 'x-forwarded-host', info.host)
    const proto = _.get(headers, 'cloudfront-forwarded-proto', _.get(headers, 'x-forwarded-proto', server.info.protocol))

    const baseUrl = `${proto}://${host}${Route.BASE_PATH === '/' ? '' : Route.BASE_PATH}`
    let url
    if (channels[ channel ].is_tv) {
      url = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil/playlist.m3u`
    } else {
      url = `http://streaming-live.rtp.pt/liveradio/${channels[ channel ].name}/playlist.m3u8?DVR`
    }

    const _headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }

    const options = { url, headers: _headers, tor: proxy }

    let { body } = await Request.get(options)

    if (channels[ channel ].is_tv) {
      body = body.replace(/chunklist_b(\d+)_slpt.m3u8/g, `${baseUrl}/chunklist.m3u8?channel=${channel}&bandwidth=$1&proxy=${proxy}`)
    } else {
      body = body.replace(/chunklist_DVR.m3u8/, `${baseUrl}/chunklist.m3u8?channel=${channel}&proxy=${proxy}`)
    }

    return body
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
