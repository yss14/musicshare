<img src="https://musicsharev2.blob.core.windows.net/musicsharestatic/musicshare_logo_gray.png" width="400">

Self-hosted open-source music sharing platform from music lovers for music lovers

[![Build Status](https://travis-ci.com/yss14/musicshare.svg?branch=master)](https://travis-ci.com/yss14/musicshare)
[![GitHub Discussions](https://img.shields.io/badge/chat-on%20github%20discussions-blue)](https://github.com/yss14/musicshare/discussions)
[![Slack Status](https://img.shields.io/badge/chat-on%20slack-blue)](https://join.slack.com/t/musicshare-workspace/shared_invite/zt-nnt5jhio-_vOV8oiL8Gz1Myw5PgJ~Sg)
[![codecov](https://codecov.io/gh/yss14/musicshare/branch/master/graph/badge.svg)](https://codecov.io/gh/yss14/musicshare)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=yss14/musicshare)](https://dependabot.com)
[![good first issues open](https://img.shields.io/github/issues/yss14/musicshare/good%20first%20issue?color=blue)](https://github.com/yss14/musicshare/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

[Installation Guide](./docs/Installation-Guide.md) | [First Steps](./docs/Installation-Guide.md#first-steps) | [Contributing](./docs/Contributing.md) | [Issue Tracker](https://github.com/yss14/musicshare/issues) | [Discuss](https://github.com/yss14/musicshare/discussions) | [Roadmap](./docs/Roadmap.md)

<br/>

**`v1.0` release will happen in March 2021!**

<br/>

## Features

MusicShare is a community-driven open-project enabling people to listen and share music with friends and family.

Upload music to your your self-hosted personal library and share it with friends and family.

<br/>

Try out [our demo](https://demo.musicshare.rocks)!

<br/>

<p float="left">
<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/personal_library.png" width="400">
<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/song_editor.png" width="400">
</p>

<br/>
<br/>

**Current Features**

-   Personal library
-   Unlimited shares with friends and family
-   Rich song meta data management (`title`, `artists`, `remixer`, `featurings`, `genres`, `songtypes`, `tags`, `labels`, `releasedate`, `year`, `duration`, `filesize`, `rips`, `bpm`)
-   Personal and shared playlists
-   Simple music player
-   Simple file upload
-   Upload duplicate detection
-   Upload automatic rich meta data extraction from id3 tags and filename
-   Granular share permissions
-   Modern and clear web ui

**Upcoming Features**

-   Crossplatform (Android and iOS) app with a modern and clear ui
-   Song cover arts
-   _Native feel_ song list including keyboard shortcuts
-   File support for `m4a` and `aac`
-   Smart playlists sourced from custom filters
-   Album and EP support

## Motivation

iTunes used to be a great and simple yet powerful music library, but suffered user experience, platform support, and mobility during the recent years.

Streaming services became the way listening to music nowadays with great multi platform support and modern user interfaces, but with the caveat of not being the owner of the music.

MusicShare is there to combine both ideas - providing a simple yet powerful service to manage and share your own self-hosted music library.

## Why not `navidrome`, `funkwhale`, or any other subsonic compatible backend?

We know that there are many alternatives out there like `navidrome`, `funkwhale`, `plex`, etc... So why even develop another new self-hosted music sharing platform?

For music lovers like us, any subsonic compatible _backend-client_ solution does not correspond to our expectations and claim of a fully comprehensive music online service.
Especially, the lack of a granular song meta data management prevented us in the past from setting up such a subsonic compatible system for larger personal music libraries.
Furthermore, in our opinion the subsonic ecosystem has a lack of good iOS and Android Apps which gives you the feeling of a Spotify or Apple Music app.
(And yes, we know that MusicShare can't provide any iOS or Android yet, but it is at the top of our todo list and enjoys the highest priority in the upcoming months!)

Nevertheless, we want to emphasize that we really appreciate the existence of an open-source standard like subsonic, enabling a diverse variety of music hosting projects and clients for the music loving self-hosting community. That's why we also decided to open source MusicShare with all it's part!

## Contributing

We are always happy welcoming new people contributing to this project. [Here's](https://github.com/yss14/musicshare/wiki/Contributing) a little guide to get started!

We are also open for questions and answers on our official [gitter](https://gitter.im/musicsharerocks/community?utm_source=share-link&utm_medium=link&utm_campaign=share-link) or [slack](https://join.slack.com/t/musicshare-workspace/shared_invite/zt-nnt5jhio-_vOV8oiL8Gz1Myw5PgJ~Sg).

## Contributors

-   Yannick Stachelscheid ([@yss14](https://github.com/yss14))
-   Felix Wohnhaas ([@fewhnhouse](https://github.com/fewhnhouse))
-   Tobias Klesel ([@tobi12345](https://github.com/tobi12345))
-   Christian Diemers ([@Freshchris01](https://github.com/Freshchris01))

## License

This project is licensed under the [AGPL](LICENSE) license.
