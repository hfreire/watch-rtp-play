/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('HTTP Request', () => {
  let subject
  let RandomUserAgent
  let request

  before(() => {
    RandomUserAgent = td.object([ 'get', 'configure' ])

    request = td.object([ 'get' ])
  })

  afterEach(() => td.reset())

  describe('when constructing', () => {
    beforeEach(() => {
      td.replace('random-http-useragent', RandomUserAgent)

      subject = require('../src/http-request')
    })

    it('should configure random user-agent', () => {
      td.verify(RandomUserAgent.configure(), { ignoreExtraArgs: true, times: 1 })
    })
  })

  describe('when sending a get http request', () => {
    const url = 'my-url'
    const userAgent = 'my-user-agent'

    beforeEach(() => {
      td.replace('random-http-useragent', RandomUserAgent)
      td.when(RandomUserAgent.get()).thenResolve(userAgent)

      td.replace('request', request)
      td.when(request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()

      subject = require('../src/http-request')
    })

    it('should fail with invalid arguments when missing url', () => {
      return subject.get()
        .catch((error) => {
          error.message.should.be.equal('invalid arguments')
        })
    })

    it('should get a random user agent', () => {
      return subject.get(url)
        .then(() => {
          td.verify(RandomUserAgent.get(), { times: 1 })
        })
    })

    it('should send a get request', () => {
      return subject.get(url)
        .then(() => {
          td.verify(request.get(), { ignoreExtraArgs: true, times: 1 })
        })
    })

    it('should use a random user agent in the get request', () => {
      return subject.get(url)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true })

          const options = captor.value

          options.should.have.nested.property('headers.User-Agent')
          options.headers[ 'User-Agent' ].should.be.equal(userAgent)
        })
    })

    it('should use url in the get request', () => {
      return subject.get(url)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true })

          const options = captor.value

          options.should.have.property('url')
          options.url.should.be.equal(url)
        })
    })
  })

  describe('when sending a get http request through tor', () => {
    const url = 'my-url'
    const headers = {}
    const tor = true

    beforeEach(() => {
      td.replace('random-user-agent', RandomUserAgent)

      td.replace('request', request)
      td.when(request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()

      subject = require('../src/http-request')
    })

    it('should use agentClass in the get request', () => {
      return subject.get(url, headers, tor)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true })

          const options = captor.value

          options.should.have.property('agentClass')
        })
    })

    it('should use agentOptions in the get request', () => {
      return subject.get(url, headers, tor)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true })

          const options = captor.value

          options.should.have.property('agentOptions')
        })
    })
  })
})
