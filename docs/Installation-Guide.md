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

In general, most of the configuration for the different services of MusicShare happens via environment variables. A full list and documentation of all available environment variables for both the `WebApp` and `Backend Service` can be found [here](./Contributing.md#backend-development).

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

Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. Then, with a single command, you create and start all the services from your configuration.

We provide you with multiple docker compose example files covering various scenarios and use cases. In the end, to run a docker compose setup, either on your local machine or on a cloud server infrastructure, you still need to do small adjustments to the configuration files, e.g. replacing some access key placeholders or adding/manipulating environment variables.

An overview over all environment variables for both the `Backend Service` and `WebApp` can be found [here](./Contributing.md#environment-variables).

**Important note:** All provided docker compose example files setup a containerized `PostgreSQL` database instance with a persistent volume stored on the local host running the container. However, for production use you should only host your own containerized database if you exactly know what you do! Otherwise, a complete data loss is possible at any time. If you are not familiar with hosting your own database instances, we recommend to use a management database service (which nowadays every major cloud hosting provider has in offer).

### AWS S3

This compose example provides a template for setting up the MusicShare distributed system using an AWS S3 file storage.

[docker-compose.awss3.yml](https://github.com/yss14/musicshare/tree/master/examples/installation/docker-compose/docker-compose.awss3.yml)

For a successful connection to your AWS S3 endpoint, replace the `S3_ACCESS_KEY` and `S3_SECRET_KEY` environment variables with your personal keys. If your S3 region differs from `eu-central-1`, adjust it accordingly. Further, you can adjust the used bucket name via the `S3_BUCKET` environment variable.

### Minio

This compose example provides a template for setting up the MusicShare distributed system using an self-hosted minio file storage. If your minio instance is hosted separately from your MusicShare setup, remove the entry from the compose yaml and adjust the connection environment variables accordingly.

[docker-compose.minio.yml](https://github.com/yss14/musicshare/tree/master/examples/installation/docker-compose/docker-compose.minio.yml)

As default, the minio secret- and access is set to `musicshare`. For enhanced security, we encourage you to adjust those keys to a more secure random generated string. If changed, don't forget to also adjust the `Backend Service` `S3_ACCESS_KEY` and `S3_SECRET_KEY` environment variables.

**Important Note:** Since the `Backend Service` access the local minio instance via a private docker network, you need to adjust your systems `hosts` file to redirect the `minio` network identifier to `localhost` or `127.0.0.1`.

On unix systems you can find the `hosts` file under `/etc/hosts`. On Windows it is accessible via `c:\windows\system32\drivers\etc\hosts`.

```
# hosts file

# musicshare docker-compose
127.0.0.1 minio
```

### Azure Blob Storage

This compose example provides a template for setting up the MusicShare distributed system using an Azure Blob Storage file storage.

[docker-compose.azureblob.yml](https://github.com/yss14/musicshare/tree/master/examples/installation/docker-compose/docker-compose.azureblob.yml)

For a successful connection to your Azure Blob Storage endpoint, replace the `AZURE_STORAGE_CONNECTION_STRING` environment variable with your personal connection string retrieved from the Azure Portal. Further, you can adjust the used container name via the `AZURE_STORAGE_CONTAINER` environment variable.

## First Steps

After you have successfully deployed a personal MusicShare instance, here are some good first steps to get you set up:

**Manage Genres and Song Types**

By default, MusicShare already has initialized some music genres and song types with a focus on modern electronic/pop music. If you want to delete/adjust those genres and song types or add new ones, simply go to `Header Menu -> Shares -> <YourLibrary> -> Meta Data`.

<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/edit_library_meta_data.png" width="400">

Please note that changes to genres and song types are not applied to existing songs. Furthermore, edit them with care, because they are incorporated during the meta data processing of newly uploaded files.

**Upload Songs**

At the moment there are two ways to upload your files. Either simply drag'n'drop them into the browser window, or use the upload button located in the song view header.

<p float="left">
<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/upload_dragndrop.png" width="400">
<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/upload_files_via_button.png" width="400">
</p>

**Create a Share**

Every user on a `MusicShare` instance owns a personal library, where songs can be uploaded. If you want to share your songs with friends or family, you must create a `Share` and invite people to this share.

`Header Menu -> Shares -> Create Share`

Via a `Share`, all songs of all libraries of the share members are merged and accessible via the shares song view.

`Header Menu -> Shares -> <ShareName>`

Further, a `Share` can own playlists, which are accessible to all share members and are only visible in the share view.

If you are part of one or multiple shares, there is also the `All` view which displays all songs and all playlists of all shares you are member of.

<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/all_overview.png" width="400">
