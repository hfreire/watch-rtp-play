/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

describe('Server', () => {
  let subject
  let serverful

  beforeAll(() => {
    serverful = td.object([])
    serverful.Serverful = td.constructor([])
  })

  afterAll(() => td.reset())

  describe('when exporting', () => {
    beforeEach(() => {
      td.replace('serverful', serverful)

      subject = require('../src/server')
    })

    it('should be instance of serverful', () => {
      expect(subject).toBeInstanceOf(serverful.Serverful)
    })
  })
})
