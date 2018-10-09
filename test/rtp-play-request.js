/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

describe('RTP Play Request', () => {
  let subject
  let Request
  let Health

  beforeAll(() => {
    Request = td.constructor([])

    Health = td.object([ 'addCheck' ])
  })

  afterEach(() => td.reset())

  describe('when exporting', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      subject = require('../src/rtp-play-request')
    })

    it('should be instance of request-on-steroids', () => {
      expect(subject).toBeInstanceOf(Request)
    })
  })

  describe('when exporting and loading request-on-steroids', () => {
    beforeEach(() => {
      td.replace('health-checkup', Health)

      subject = require('../src/rtp-play-request')
    })

    it('should create a request-on-steroids with get function', () => {
      expect(subject.get).toBeInstanceOf(Function)
    })

    it('should create a request-on-steroids with circuitBreaker', () => {
      expect(subject.circuitBreaker).toBeDefined()
    })
  })

  describe('when constructing', () => {
    beforeEach(() => {
      td.replace('request-on-steroids', Request)

      td.replace('health-checkup', Health)

      subject = require('../src/rtp-play-request')
    })

    it('should construct request instance with default options', () => {
      const captor = td.matchers.captor()

      td.verify(new Request(captor.capture()), { times: 1 })

      const options = captor.value
      expect(options).toHaveProperty('perseverance.retry.max_tries', 2)
    })

    it('should add rtp play health check', () => {
      td.verify(Health.addCheck('rtp-play', td.matchers.isA(Function)), { times: 1 })
    })
  })
})
