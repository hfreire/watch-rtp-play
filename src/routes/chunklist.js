/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')

const Request = require('../rtp-play-request')
const channels = require('../channels.json')

class Chunklist extends Route {
  constructor () {
    super('GET', '/chunklist.m3u8', 'Chunklist', 'Returns a chunklist')
  }

  async handler ({ query }, h) {
    const { channel, bandwidth = 640000, proxy = false } = query

    if (!channels[ channel ]) {
      throw Boom.badRequest(`Invalid channel ${channel}`)
    }

    const headers = { 'Referer': `http://www.rtp.pt/play/direto/${channel}` }

    let baseUrl
    let url
    if (channels[ channel ].is_tv) {
      baseUrl = `https://streaming-live.rtp.pt/liverepeater/smil:${channel}.smil`
      url = `${baseUrl}/chunklist_b${bandwidth}_slpt.m3u8`
    } else {
      baseUrl = `http://streaming-live.rtp.pt/liveradio/${channels[ channel ].name}`
      url = `${baseUrl}/chunklist_DVR.m3u8`
    }

    const options = { url, headers, tor: proxy }

    let { body } = await Request.get(options)

    body = body.replace(/,\n/g, `,\n${baseUrl}/`)

    return body
  }

  validate () {
    return {
      query: {
        channel: Joi.string()
          .required()
          .description('the channel'),
        bandwidth: Joi.number()
          .optional()
          .description('the bandwidth'),
        proxy: Joi.boolean()
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

module.exports = new Chunklist()
