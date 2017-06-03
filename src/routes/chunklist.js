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
    super('GET', '/chunklist.m3u8', 'Chunklist', 'Returns a chunklist')
  }

  handler ({ query }, reply) {
    const { channel, bandwidth = 640000, proxy = false } = query

    if (!channels[ channel ]) {
      reply(Boom.badRequest())

      return
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

    HTTPRequest.get(url, headers, proxy)
      .then(({ body }) => {
        body = body.replace(/,\n/g, `,\n${baseUrl}/`)

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

module.exports = new Playlist()
