# :tv: Watch and :radio: listen 🇵🇹 RTP Play without a :computer: browser

[![](https://github.com/hfreire/watch-rtp-play/workflows/ci/badge.svg)](https://github.com/hfreire/watch-rtp-play/actions?workflow=ci)
[![](https://github.com/hfreire/watch-rtp-play/workflows/cd/badge.svg)](https://github.com/hfreire/watch-rtp-play/actions?workflow=cd)
[![Coverage Status](https://coveralls.io/repos/github/hfreire/watch-rtp-play/badge.svg?branch=master)](https://coveralls.io/github/hfreire/watch-rtp-play?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/hfreire/watch-rtp-play/badge.svg)](https://snyk.io/test/github/hfreire/watch-rtp-play)
[![](https://img.shields.io/github/release/hfreire/watch-rtp-play.svg)](https://github.com/hfreire/watch-rtp-play/releases)
[![Docker Stars](https://img.shields.io/docker/stars/hfreire/watch-rtp-play.svg)](https://hub.docker.com/r/hfreire/watch-rtp-play/)
[![Docker Pulls](https://img.shields.io/docker/pulls/hfreire/watch-rtp-play.svg)](https://hub.docker.com/r/hfreire/watch-rtp-play/)

> Watch 8 TV and listen 14 radio channels on any device that can play [HTTP Live Streaming](https://en.wikipedia.org/wiki/HTTP_Live_Streaming).

<p align="center"><img src="share/github/overview.gif" width="620"></p>

### Features
* 8 TV channels :tv:
* 14 radio channels :radio:
* Uses [Request on Steroids](https://github.com/hfreire/request-on-steroids) to rate limit, retry and circuit break outgoing HTTP requests :white_check_mark:
* Launch :rocket: inside a Docker container :whale: so you don't need to manage the dependencies :raised_hands: :white_check_mark:
* Deploy on [AWS](https://aws.amazon.com) using an [Antifragile Infrastructure](https://github.com/antifragile-systems/antifragile-infrastructure) that allows you to easily monitor activity and scale :chart_with_upwards_trend: capacity :white_check_mark:

### How to use

#### Use it in your terminal
Using it in your terminal requires [Docker](https://www.docker.com) installed in your system.

##### Run the Docker image in a container
Detach from the container and expose port `4543`.
```
docker run -d -p "4543:3000" hfreire/watch-rtp-play
```

##### Play RTP1 with ffmpeg player
```
ffplay http://localhost:4543/playlist.m3u8?channel=rtp1
```

##### AirPlay RTP1 to Kodi
Use [kodi.sh gist](https://gist.github.com/hfreire/5c558dc35ee842c32bda1656f87f302b) to stream RTP1 to a [Kodi](https://kodi.tv) media player.
```
kodi.sh localhost:36667 http://localhost:4543/playlist.m3u8?channel=rtp1
```

##### Cast RTP1 to Chromecast
Use [castnow](https://github.com/xat/castnow) to stream RTP1 to a [Chromecast](https://www.google.com/chromecast) media player.
```
castnow http://192.168.0.1:4543/playlist.m3u8?channel=rtp1
```

#### Available REST API endpoints
Swagger documentation available at `http://localhost:4543/docs`.

#### Available usage environment variables
Variable | Description | Required | Default value
:---:|:---:|:---:|:---:
PORT | The port to be used by the HTTP server. | false | `3000`
API_KEYS | The secret keys that should be used when securing endpoints. | false | `undefined`
SO_TIMEOUT | TCP socket connection timeout. | false | `120000`
BASE_PATH | Base path to be prefixed to all available endpoint paths. | false | `/`
PING_PATH | Endpoint path for pinging app. | false | `/ping`
HEALTHCHECK_PATH | Endpoint for checking app health. | false | `/healthcheck`
LOG_LEVEL | The log level verbosity. | false | `info`
ENVIRONMENT | The environment the app is running on. | false | `undefined`
ROLLBAR_API_KEY | The server API key used to talk with Rollbar. | false | `undefined`

### How to build
##### Clone the GitHub repo
```
git clone https://github.com/hfreire/watch-rtp-play.git
```

##### Change current directory
```
cd watch-rtp-play
```

##### Run the NPM script that will build the Docker image
```
npm run build
```

### How to deploy

#### Deploy it from your terminal
Deploying it from your terminal requires [terraform](https://www.terraform.io) installed on your system and an [antifragile infrastructure](https://github.com/antifragile-systems/antifragile-infrastructure) setup available in your [AWS](https://aws.amazon.com) account.

##### Clone the GitHub repo
```
git clone https://github.com/hfreire/watch-rtp-play.git
```

##### Change current directory
```
cd watch-rtp-play
```

##### Run the NPM script that will deploy all functions
```
npm run deploy
```

#### Available deployment environment variables
Variable | Description | Required | Default value
:---:|:---:|:---:|:---:
VERSION | The version of the app. | false | `latest`
ANTIFRAGILE_STATE_AWS_REGION | The AWS region used for the antifragile state . | false | `undefined`
ANTIFRAGILE_STATE_AWS_S3_BUCKET | The AWS S3 bucket used for the antifragile state. | false | `undefined`
ANTIFRAGILE_STATE_AWS_DYNAMODB_TABLE | The AWS DynamoDB table used for the antifragile state. | false | `undefined`
ANTIFRAGILE_INFRASTRUCTURE_DOMAIN_NAME | The domain used for the antifragile infrastructure. | true | `undefined`

### How to contribute
You can contribute either with code (e.g., new features, bug fixes and documentation) or by [donating 5 EUR](https://paypal.me/hfreire/5). You can read the [contributing guidelines](CONTRIBUTING.md) for instructions on how to contribute with code.

All donation proceedings will go to the [Sverige för UNHCR](https://sverigeforunhcr.se), a swedish partner of the [UNHCR - The UN Refugee Agency](http://www.unhcr.org), a global organisation dedicated to saving lives, protecting rights and building a better future for refugees, forcibly displaced communities and stateless people.

### License
Read the [license](./LICENSE.md) for permissions and limitations.
