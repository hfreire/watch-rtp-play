/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Request = require('request-on-steroids')

describe('RTP Play Request', () => {
  let subject
  let Health

  before(() => {
    Health = td.object([ 'addCheck' ])
  })

  afterEach(() => td.reset())

  describe('when constructing', () => {
    beforeEach(() => {
      td.replace('health-checkup', Health)

      subject = require('../src/rtp-play-request')
    })

    it('should add rtp-play health check', () => {
      td.verify(Health.addCheck('rtp-play', td.matchers.isA(Function)), { times: 1 })
    })

    it('should return an instance of request-on-steroids', () => {
      subject.should.be.instanceOf(Request)
    })
  })
})
