/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const Request = require('request-on-steroids')

const _ = require('lodash')

const Health = require('health-checkup')

const defaultOptions = {
  perseverance: {
    retry: { max_tries: 2 }
  }
}

class RtpPlayRequest extends Request {
  constructor (options = {}) {
    super(_.defaultsDeep({}, options, defaultOptions))

    Health.addCheck('rtp-play', async () => {
      if (this.circuitBreaker.isOpen()) {
        throw new Error(`circuit breaker is open`)
      }
    })
  }
}

module.exports = new RtpPlayRequest()
