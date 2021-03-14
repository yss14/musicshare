# Contributing

## Disclaimer

It's our goal to provide a simple to use self-hosted music library, both from a UI and setup perspective.
Thus, MusicShare strives for a simple and intuitive UI design, as well as a easy to setup system architecture with few dependencies.

## Contributing

Feel free to pick items from the current [project board](https://github.com/yss14/musicshare/projects), open issues and pull requests.

## System Architecture

**Backend Services**: Our backend is powered by Node.JS, providing a GraphQL API to fetch and update data, as well as some REST routes for file upload.

**Database**: Data is stored in a Cassandra database, providing fast reads for big libraries.

**FileStorage**: The backend is able to support external file storage provider. Currently, only an adapter for Azure Blob Storage is provided

**Frontend**: The frontend part of MusicShare is backed by Single-Page React Application.

## Local Setup

### Run The Project

**Windows:** Be sure to have `node-gyp` and the latest Node.JS version installed. For `node-gyp`, see instructions [here](https://github.com/nodejs/node-gyp#installation).

1. Clone this repo
2. Run `npm install` or `yarn install` to install and bootstrap dependencies
3. Create local configurations for `frontend` and `backend` by copying the sample `.env` files (`cp projects/backend/config/development_sample.env projects/backend/development.env && cp projects/frontend/config/sample.env projects/frontend/.env`)
4. Create and start MusicShares dependencies PostgreSQL database with docker (`docker-compose up`)

    a) **If your system already runs a PostgreSQL database:**

    In this case, you only need to spin up the Minio (S3 compatible file storage) service and azurite (an Azure Blob Storage emulator). Just run `docker-compose up -d minio azurite`

    b) **If your system does no already run a PostgreSQL database:**

    Run `docker-compose up -d` to spin up a PostgreSQL database and the Minio (S3 compatible file storage) service.

5. Open two terminal tabs and start backend and frontend via `npm run start:backend` and `npm run start:frontend`, respectively.
6. Once both parts are up and running, you can log in via the default user `test@musicshare.rocks` with the super-safe password `test1234`.

If you want to run parts of the project separately, have a look at the provided scripts of the root [package.json](package.json).

**I don't have docker installed (e.g. Apple Silicon)**

No problem, our required development dependencies like `postgres`, `minio`, and `azure blob` are also available as native services or emulators.

-   for `postgres` you can easily find good tutorial guides on how to install postgres native on your os
-   for `minio` there are also plenty of installation guides on how to install it without docker as a native service
-   for `azure blob` you can simply use `azurite`, an Azure Blob Storage emulator, via the `npm run start:azurite` script

#### Troubleshooting

-   `SQLError: error: database "<user>" does not exist SQL: SELECT FROM pg_database WHERE datname = 'musicshare' Values:`
    -   connect to the PostgreSQL database first via a third party client or `psql` and create a database named `<user>`
    -   for more information on this problem you can also visit [this StackOverflow thread](https://stackoverflow.com/questions/17633422/psql-fatal-database-user-does-not-exist)

### Testing

To execute the test cases, you need to create a separate `test.env` for the `backend`
project (`cp projects/backend/config/development_sample.env projects/backend/test.env`),
and adjust the database connection variables accordingly.

**Important notes**

-   Be sure to always run tsc in watch mode (e.g. via `dev:backend` npm script) when writing test cases since `ts-jest` is configured to skip type checking
-   When calling `executeGraphQLQuery` function in integration tests, the default _logged-in_ user is `testData.users.user1`

## Code Standards & Naming Conventions

-   Choice between `type` and `interface` is up to you - choose what fits best for a particular use case
-   React props types are named in the following fashion `ComponentNameProps`
-   Use object arguments instead of single ones for `n>=3` function arguments
-   File naming
    -   React Components: Pascalcase (e.g. `MyFancyComponent`)
    -   Constructor(functions): Pascalcase (e.g. `SomeEntityService`)
    -   Files containg types: Pascalcase (e.g. `SomeTypeAggregations`)
    -   Util(function)s: Camelcase (e.g. `tryParseInt`), try to split functions into separate files
    -   Typings: Kebabcase (e.g. `some-untyped-module.d.ts`)
    -   Anything else: Camelcase

## Best Practices

-   If avoidable, do not hard-code values, but use environment variables

## Backend Development

### Environment Variables

| Name                                             | Type      | Required | Default                       | Description                                                                            |
| ------------------------------------------------ | --------- | -------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| `POSTGRES_HOST`                                  | `string`  | `false`  | `127.0.0.1`                   |                                                                                        |
| `POSTGRES_PORT`                                  | `number`  | `false`  | `5432`                        |                                                                                        |
| `POSTGRES_DATABASE`                              | `string`  | `false`  | `musicshare`                  |                                                                                        |
| `POSTGRES_PASSWORD`                              | `string`  | `true`   |                               |                                                                                        |
| `POSTGRES_USER`                                  | `string`  | `false`  | `postgres`                    |                                                                                        |
| `CLEAR_DATABASE`                                 | `boolean` | `false`  | `false`                       | Clears all table data on startup                                                       |
| `SEED_DATABASE`                                  | `boolean` | `false`  | `false`                       | Seeds cleared database with test data. Useful for development.                         |
|                                                  |           |          |                               |                                                                                        |
| `FRONTEND_BASEURL`                               | `string`  | `false`  | `http://localhost:3000`       | Url pointing to the frontend                                                           |
| `JWT_SECRET`                                     | `string`  | `true`   |                               | Unique secure random string                                                            |
| `ENABLE_PLAYGROUND`                              | `boolean` | `false`  | `false`                       | Enabling the GraphQL Playground reachable under `http(s)://<backendurl>/graphql`       |
|                                                  |           |          |                               |                                                                                        |
| `SETUP_USERNAME`                                 | `string`  | `false`  | `musicshare`                  | Username of the first user created on system setup                                     |
| `SETUP_PASSWORD`                                 | `string`  | `false`  | `WeLoveMusic`                 | Password of the first user created on system setup (should be changed afterwards!!)    |
| `SETUP_EMAIL`                                    | `string`  | `false`  | `donotreply@musicshare.rocks` | E-Mail of the first user created on system setup                                       |
| `SETUP_SHARE_NAME`                               | `string`  | `false`  | `MyShare`                     | Share name of the first user created on system setup                                   |
|                                                  |           |          |                               |                                                                                        |
| `DUPLICATE_DETECTION_NEAR_DUPLICATES_THRESHOULD` | `float`   | `false`  | `0.75`                        | Similarity threshold for near duplicate detection of new uploads (between 0.0 and 1.0) |
| `PUBLIC_REGISTRATION`                            | `boolean` | `false`  | `false`                       | Enabling public registration                                                           |
| `SHARE_QUOTA`                                    | `integer` | `false`  | `1.000.000.000.000`           | Quota (in bytes) applied to each library, defaults to 1TB                              |
|                                                  |           |          |                               |                                                                                        |
| `FILE_STORAGE_PROVIDER`                          | `enum`    | `false`  | `awss3`                       | `awss3` or `azureblob`                                                                 |
| `S3_ACCESS_KEY`                                  | `string`  | `true`   |                               | Required if storage provider is `awss3`                                                |
| `S3_SECRET_KEY`                                  | `string`  | `true`   |                               | Required if storage provider is `awss3`                                                |
| `S3_HOST`                                        | `string`  | `true`   |                               | Required if storage provider is `awss3`                                                |
| `S3_BUCKET`                                      | `string`  | `false`  | `musicshare`                  |                                                                                        |
| `S3_REGION`                                      | `string`  | `false`  | default region of aws sdk     |                                                                                        |
| `AZURE_STORAGE_CONNECTION_STRING`                | `string`  | `true`   |                               | Required if storage provider is `azureblob`                                            |
| `AZURE_STORAGE_CONTAINER`                        | `string`  | `false`  | `musicshare`                  |                                                                                        |
| `FILE_STORAGE_ACCESS_TOKEN_EXPIRY`               | `integer` | `false`  | `30`                          | Validity of file access link in minutes for the music player                           |

## Frontend Development

### Environment Variables

| Name                               | Type      | Required | Default | Description                                                                       |
| ---------------------------------- | --------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `REACT_APP_MUSICSHARE_BACKEND_URL` | `string`  | `true`   |         | Url pointing to end MusicShare endpoint, e.g. `https://api-demo.musicshare.rocks` |
| `REACT_APP_PUBLIC_REGISTRATION`    | `boolean` | `false`  | `false` | Enabling public registration (backend must also have this feature enabled!)       |
