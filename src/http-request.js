/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const Promise = require('bluebird')

const RandomUserAgent = require('random-http-useragent')

const { getAsync } = Promise.promisifyAll(require('request'))

const defaultOptions = { socksHost: 'localhost', socksPort: 9050 }

class HTTPRequest {
  constructor (options = {}) {
    this._options = _.defaults(options, defaultOptions)

    RandomUserAgent.configure({ maxAge: 600000, preFetch: true })
  }

  get (url, headers = {}, tor = false) {
    if (!url) {
      return Promise.reject(new Error('invalid arguments'))
    }

    const options = { url }

    if (tor) {
      const agentClass = _.startsWith(url, 'https') ? require('socks5-https-client/lib/Agent') : require('socks5-http-client/lib/Agent')
      const agentOptions = _.pick(this._options, [ 'socksHost', 'socksPort' ])

      _.merge(options, { agentClass, agentOptions })
    }

    return RandomUserAgent.get()
      .then((userAgent) => {
        options.headers = _.assign({}, headers, { 'User-Agent': userAgent })

        return getAsync(options)
      })
  }
}

module.exports = new HTTPRequest()
