/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('RTP Play Request', () => {
  let subject
  let Health
  let Request

  before(() => {
    Health = td.object([ 'addCheck' ])

    Request = td.constructor([])
  })

  afterEach(() => td.reset())

  describe('when exporting', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      subject = require('../src/rtp-play-request')
    })

    it('should be instance of request-on-steroids', () => {
      subject.should.be.instanceOf(Request)
    })
  })

  describe('when exporting and loading request-on-steroids', () => {
    beforeEach(() => {
      td.replace('health-checkup', Health)

      subject = require('../src/rtp-play-request')
    })

    it('should create a request-on-steroids with post function', () => {
      subject.should.have.property('post')
      subject.post.should.be.instanceOf(Function)
    })
  })

  describe('when constructing', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      td.replace('health-checkup', Health)

      subject = require('../src/rtp-play-request')
    })

    it('should add rtp play health check', () => {
      td.verify(Health.addCheck('rtp-play', td.matchers.isA(Function)), { times: 1 })
    })
  })
})
