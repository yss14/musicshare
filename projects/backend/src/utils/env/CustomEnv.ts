export enum CustomEnv {
	POSTGRES_HOST = "POSTGRES_HOST",
	POSTGRES_PORT = "POSTGRES_PORT",
	POSTGRES_DATABASE = "POSTGRES_DATABASE",
	POSTGRES_PASSWORD = "POSTGRES_PASSWORD",
	POSTGRES_USER = "POSTGRES_USER",

	CLEAR_DATABASE = "CLEAR_DATABASE",
	SEED_DATABASE = "SEED_DATABASE",

	REST_PORT = "REST_PORT",

	JWT_SECRET = "JWT_SECRET",

	ENABLE_PLAYGROUND = "ENABLE_PLAYGROUND",
	APOLLO_ENGINE_API_KEY = "APOLLO_ENGINE_API_KEY",
	APOLLO_ENGINE_SCHEMA_TAG = "APOLLO_ENGINE_SCHEMA_TAG",

	SETUP_USERNAME = "SETUP_USERNAME",
	SETUP_PASSWORD = "SETUP_PASSWORD",
	SETUP_EMAIL = "SETUP_EMAIL",
	SETUP_SHARE_NAME = "SETUP_SHARE_NAME",

	FILE_STORAGE_PROVIDER = "FILE_STORAGE_PROVIDER",
	FILE_STORAGE_ACCESS_TOKEN_EXPIRY = "FILE_STORAGE_ACCESS_TOKEN_EXPIRY",

	S3_HOST = "S3_HOST",
	S3_ACCESS_KEY = "S3_ACCESS_KEY",
	S3_SECRET_KEY = "S3_SECRET_KEY",
	S3_BUCKET = "S3_BUCKET",
	S3_REGION = "S3_REGION",

	AZURE_STORAGE_CONTAINER = "AZURE_STORAGE_CONTAINER",

	FRONTEND_BASEURL = "FRONTEND_BASEURL",

	DUPLICATE_DETECTION_NEAR_DUPLICATES_THRESHOULD = "DUPLICATE_DETECTION_NEAR_DUPLICATES_THRESHOULD",

	PUBLIC_REGISTRATION = "PUBLIC_REGISTRATION",

	SHARE_QUOTA = "SHARE_QUOTA",
}
