/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const _ = require('lodash')

const td = require('testdouble')
td.config({ ignoreWarnings: true })
require('testdouble-jest')(td, jest)

afterEach(() => td.reset())

global._ = _
global.td = td
