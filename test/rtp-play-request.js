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
    Request = require('request-on-steroids')
    jest.mock('request-on-steroids')

    Health = require('health-checkup')
    jest.mock('health-checkup')
  })

  describe('when exporting', () => {
    beforeEach(() => {
      subject = require('../src/rtp-play-request')
    })

    it('should be instance of request-on-steroids', () => {
      expect(subject).toBeInstanceOf(Request)
    })
  })

  describe('when exporting and loading request-on-steroids', () => {
    beforeEach(() => {
      subject = require('../src/rtp-play-request')
    })

    it('should create a request-on-steroids with get function', () => {
      expect(subject.get).toBeInstanceOf(Function)
    })
  })

  describe('when constructing', () => {
    beforeEach(() => {
      subject = require('../src/rtp-play-request')
    })

    it('should construct request instance with default options', () => {
      expect(Request).toHaveBeenCalledWith({ perseverance: { retry: { max_tries: 2 } } })
    })

    it('should add rtp play health check', () => {
      expect(Health.addCheck).toHaveBeenCalledTimes(1)
      expect(Health.addCheck).toHaveBeenCalledWith('rtp-play', expect.any(Function))
    })
  })
})
