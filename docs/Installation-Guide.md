# General

One key idea of MusicShare is to keep the number of external dependencies small. Thus, at the moment it only requires 4 dependencies to get the whole system up and running: `WebApp`, `Backend Service`, `PostgreSQL Database`, and a `FileStorage`.

![MusicShare System Architecture](https://musicshare-public.s3.eu-central-1.amazonaws.com/system_arch.jpg)

`WebApp`, `Backend Service`, and `PostgreSQL Database` are fixed dependencies. For the `FileStorage` there are multiple choices on where to host the uploaded audio files. At the moment, MusicShare supports `Azure Blob Storage`, `AWS S3`, and `minio` as file storage providers.

The MusicShare `WebApp` and `Backend Service` are provided as publicly available Docker Containers.

**WebApp**

-   [GitHub Registry](https://github.com/yss14/musicshare/packages/69346)
-   [Dockerhub Registry](https://hub.docker.com/r/musicshare/frontend)

**Backend Service**

-   [GitHub Registry](https://github.com/yss14/musicshare/packages/69254)
-   [Dockerhub Registry](https://hub.docker.com/r/musicshare/backend)

**PostgreSQL**

For the `PostgreSQL Database` there are various to host a database instance. You can of course self-host a PostgreSQL instance, either via a native installation or via Docker container. Or you can easily host an instance as "Managed Database" on one of the many cloud service providers such as AmazonAWS, Microsoft Azure, Google Cloud Platform, DigitalOcean, etc...

**Minio**

If you want to go the "full" self-hosted way, [minio](https://min.io/) provides a S3 API compatible way to deploy your own file storage instance.

# Installation

In this section we show up multiple ways to self-host your own MusicShare instance.

In general, most of the configuration for the different services of MusicShare happens via environment variables. A full list and documentation of all available environment variables for both the `WebApp` and `Backend Service` can be found [here](./Contributing#backend-development).

## Custom System Setup

Since there are plenty of different ways on how to deploy your own MusicShare instance, in this section we briefly describe how you can _glue_ the different parts of the system together. In the the end it's up to you how much you want to focus on self-hosting or whether you want to host some parts of the system on cloud provider infrastructure.

### WebApp <> Backend Service

To connect the `WebApp` with the MusicShare `Backend Service` the environment variable `REACT_APP_MUSICSHARE_BACKEND_URL` of the `WebApp` docker container must point to the public `Backend Service` endpoint, e.g. `REACT_APP_MUSICSHARE_BACKEND_URL=https://api-demo.musicshare.rocks`.

### Backend Service <> File Storage

**AWS S3**

The MusicShare `Backend Service` talks to the AWS S3 endpoint via a RESTful API. First of all, we must tell the backend that the desired file storage providers is an AWS S3 compatible API `FILE_STORAGE_PROVIDER=awss3`. Next, `S3_REGION` specifies in which AWS region the S3 service is hosted, e.g. `eu-central-1` or `us-east-1`. For authentication, you need to obtain an `AccessKey` and `SecretKey` via AWS IAM and provide them via the environment variables `S3_ACCESS_KEY` and `S3_SECRET_KEY`. Finally, if you want to specify a custom S3 bucket the `Backend Service` should use do this via `S3_BUCKET` (default bucket is `musicshare`).

**Azure Blob Storage**

The MusicShare `Backend Service` talks to the Azure Blob Storage endpoint via a RESTful API. Once you've created a blob storage, you simply need to obtain the [connection string](https://docs.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string) and provide it via the `AZURE_STORAGE_CONNECTION_STRING` environment variable. If you want to specify a custom Azure Blob container the `Backend Service` should use do this via `AZURE_STORAGE_CONTAINER` (default bucket is `musicshare`).

**minio**

Since minio implements a S3 compatible API, we can simply use the AWS S3 environment variables. Instead of providing a region, we need to tell the `Backend Service` under which url our self-hosted minio instance is reachable via the `S3_HOST` environment variable, e.g. `https://my-self-hosted-minio.somedomain.com` or `http://localhost:9000`. For authentication, you need to provide an `AccessKey` and `SecretKey` via the environment variables `S3_ACCESS_KEY` and `S3_SECRET_KEY`. Finally, if you want to specify a custom minio bucket the `Backend Service` should use do this via `S3_BUCKET` (default bucket is `musicshare`).

### Backend Service <> PostgreSQL

Setting up the connection to your PostgreSQL instance also works via environment variables. `POSTGRES_HOST` and `POSTGRES_PORT` specify the database instance endpoint. Via `POSTGRES_PASSWORD` and `POSTGRES_USER` authentication is setup. Finally, via `POSTGRES_DATABASE` you need to state which database the `Backend Service` should use to store all the data.

## Docker Compose
