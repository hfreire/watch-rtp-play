/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Request = require('request-on-steroids')

const Promise = require('bluebird')

const Health = require('health-checkup')

class RtpPlayRequest extends Request {
  constructor (options) {
    super(options)

    Health.addCheck('rtp-play', () => new Promise((resolve, reject) => {
      if (this.circuitBreaker.isOpen()) {
        return reject(new Error(`circuit breaker is open`))
      } else {
        return resolve()
      }
    }))
  }
}

module.exports = new RtpPlayRequest()
