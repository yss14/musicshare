<img src="https://musicsharev2.blob.core.windows.net/musicsharestatic/musicshare_logo_gray.png" width="400">

Simple yet powerful self-hosted open-source music library.

[![Build Status](https://travis-ci.com/yss14/musicshare.svg?branch=master)](https://travis-ci.com/yss14/musicshare)
[![codecov](https://codecov.io/gh/yss14/musicshare/branch/master/graph/badge.svg)](https://codecov.io/gh/yss14/musicshare)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=yss14/musicshare)](https://dependabot.com)

## Motivation

iTunes used to be a really great and simple yet powerful music library, but suffered user experience, platform support, and mobility during the recent years.

Streaming services became the way listening to music nowadays, but you are not the owner of the music.

MusicShare is there to combine both ideas - providing a simple yet powerful service to manage and share your own self-hosted music library.

## Current Development Status

We are working hard to release the first version of MusicShare. See the [roadmap](https://github.com/yss14/musicshare/wiki/Roadmap) and [project status](https://github.com/yss14/musicshare/projects).

## Local Setup

### Run The Project

**Windows:** Be sure to have `node-gyp` and the latest Node.JS version installed. For `node-gyp`, see instructions [here](https://github.com/nodejs/node-gyp#installation).

1. Clone this repo
2. Run `npm install` or `yarn install` to install and bootstrap dependencies
3. Create local configurations for `frontend` and `backend` by copying the sample `.env` files (`cp projects/backend/config/development_sample.env projects/backend/development.env && cp projects/frontend/config/sample.env projects/frontend/.env`)
4. Create and start MusicShares dependencies PostgreSQL database with docker (`docker-compose up`)

    a) **If your system already runs a PostgreSQL database:**

    In this case, you only need to spin up the Minio (S3 compatible file storage) service. Just run `docker-compose up -d minio`.

    b) **If your system does no already run a PostgreSQL database:**

    Run `docker-compose up -d` to spin up a PostgreSQL database and the Minio (S3 compatible file storage) service.

5. Open two terminal tabs and start backend and frontend via `npm run start:backend` and `npm run start:frontend`, respectively.
6. Once both parts are up and running, you can log in via the default user `test@musicshare.rocks` with the super-safe password `test1234`.

If you want to run parts of the project seperatly, have a look at the provided scripts of the root [package.json](package.json).

#### Troubleshooting

-   `SQLError: error: database "<user>" does not exist SQL: SELECT FROM pg_database WHERE datname = 'musicshare' Values:`
    -   connect to the PostgreSQL database first via a thrid party client or `psql` and create a database named `<user>`
    -   for more information on this problem you can also visit [this StackOverflow thread](https://stackoverflow.com/questions/17633422/psql-fatal-database-user-does-not-exist)

### Testing

To execute the test cases, you need to create a separate `test.env` for the `backend`
project (`cp projects/backend/config/development_sample.env projects/backend/test.env`),
and adjust the database connection variables accordingly.

**Important notes**

-   Be sure to always run tsc in watch mode (e.g. via `dev:backend` npm script) when writing test cases since `ts-jest` is configured to skip type checking
-   When calling `executeGraphQLQuery` function in integration tests, the default _logged-in_ user is `testData.users.user1`

## Contributing

We are always happy welcoming new people contributing to this project. [Here's](https://github.com/yss14/musicshare/wiki/Contributing) a little guide to get started!

## Contributors

-   Yannick Stachelscheid ([@yss14](https://github.com/yss14))
-   Felix Wohnhaas ([@fewhnhouse](https://github.com/fewhnhouse))
-   Tobias Klesel ([@tobi12345](https://github.com/tobi12345))
-   Christian Diemers ([@Freshchris01](https://github.com/Freshchris01))

## License

This project is licensed under the [AGPL](LICENSE) license.
