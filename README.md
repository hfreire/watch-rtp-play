# :tv: Watch and :radio: listen 🇵🇹 RTP Play without a :computer: browser

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/hfreire/watch-rtp-play.svg?branch=master)](https://travis-ci.org/hfreire/watch-rtp-play)
[![Coverage Status](https://coveralls.io/repos/github/hfreire/watch-rtp-play/badge.svg?branch=master)](https://coveralls.io/github/hfreire/watch-rtp-play?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/hfreire/watch-rtp-play.svg)](https://greenkeeper.io/)
[![](https://img.shields.io/github/release/hfreire/watch-rtp-play.svg)](https://github.com/hfreire/watch-rtp-play/releases)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Watch 8 TV and 14 radio channels on any device that can play [HTTP Live Streaming](https://en.wikipedia.org/wiki/HTTP_Live_Streaming).

<p align="center"><img src="share/github/vlc.gif" width="540"></p>

### Features
* 8 TV channels :tv: 
* 14 radio channels :radio:
* Launch :rocket: inside a Docker container :whale: so you don't need to manage the dependencies :raised_hands: :white_check_mark:
* Quickly deploy :runner: and easily scale :two_men_holding_hands: the number of servers by using Rancher :white_check_mark:

### How to use

#### Use it in your terminal
Run the Docker image in a container exposing the port `4543`
```
docker run -d -p "4543:3000" hfreire/watch-rtp-play
```

Open the HLS URL with ffmpeg player
```
ffplay "http://localhost:4543/playlist.m3u8?channel=rtp1"
```

#### Available environment variables
Variable | Description | Required | Default value
:---:|:---:|:---:|:---:
PORT | The port to be used by the HTTP server | false | `3000`
API_KEYS | The secret keys that should be used when securing endpoints | false | `undefined`
ENVIRONMENT | The environment the app is running on | false | `undefined`
ROLLBAR_API_KEY | The server API key used to talk with Rollbar | false | `undefined`

### How to build
Clone the GitHub repo
```
git clone https://github.com/hfreire/watch-rtp-play.git
```

Change current directory
```
cd watch-rtp-play
```

Install dependencies
```
npm install
```

Run the NPM script that will build the Docker image
```
npm run build
```
