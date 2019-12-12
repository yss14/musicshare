import { CustomEnv } from "../utils/env/CustomEnv";
import { __PROD__ } from "../utils/env/env-constants";

type FileStorageProvider = 'azureblob' | 'awss3';

export interface IConfig {
	database: {
		host: string;
		port: number;
		database: string;
		user: string;
		password?: string;
		clear?: boolean;
		seed?: boolean;
	},
	jwt: {
		secret: string;
	},
	server: {
		enableGraphQLPlayground: boolean;
	},
	setup: {
		seed: {
			name: string;
			password: string;
			email: string;
			shareName: string;
		}
	},
	fileStorage: {
		provider: 'azureblob' | 'awss3';
		s3?: {
			host?: string;
			accessKey: string;
			secretKey: string;
			bucket?: string;
			region?: string;
		},
		azureStorage?: {
			container?: string;
		}
	},
	frontend: {
		baseUrl: string;
	}
}

const processFileStorageProvider = (str: string | undefined): FileStorageProvider | undefined =>
	(str === 'azureblob' || str === 'awss3') ? str : undefined;

const requiredEnvVars = [CustomEnv.JWT_SECRET];

export const configFromEnv = (): IConfig => {
	for (const requiredEnvVar of requiredEnvVars) {
		if (process.env[requiredEnvVar] === undefined) {
			throw new Error(`Required environment variable ${requiredEnvVar} is missing`);
		}
	}

	let s3Config = undefined;

	if (process.env[CustomEnv.S3_ACCESS_KEY] && process.env[CustomEnv.S3_SECRET_KEY]) {
		s3Config = {
			accessKey: process.env[CustomEnv.S3_ACCESS_KEY]!,
			secretKey: process.env[CustomEnv.S3_SECRET_KEY]!,
			host: process.env[CustomEnv.S3_HOST],
			bucket: process.env[CustomEnv.S3_BUCKET],
			region: process.env[CustomEnv.S3_REGION],
		}
	}

	return {
		database: {
			host: process.env[CustomEnv.POSTGRES_HOST] || '127.0.0.1',
			port: getInteger(process.env[CustomEnv.POSTGRES_PORT]) || 5432,
			database: process.env[CustomEnv.POSTGRES_DATABASE] || 'musicshare',
			password: process.env[CustomEnv.POSTGRES_PASSWORD],
			user: process.env[CustomEnv.POSTGRES_USER] || 'postgres',
			clear: getBoolean(process.env[CustomEnv.CLEAR_DATABASE]) || false,
			seed: getBoolean(process.env[CustomEnv.SEED_DATABASE]) || false,
		},
		jwt: {
			secret: process.env[CustomEnv.JWT_SECRET]!
		},
		server: {
			enableGraphQLPlayground: getBoolean(process.env[CustomEnv.ENABLE_PLAYGROUND]) || !__PROD__,
		},
		setup: {
			seed: {
				name: process.env[CustomEnv.SETUP_USERNAME] || 'musicshare',
				password: process.env[CustomEnv.SETUP_PASSWORD] || 'ILoveMusic',
				email: process.env[CustomEnv.SETUP_EMAIL] || 'donotreply@musicshare.rocks',
				shareName: process.env[CustomEnv.SETUP_SHARE_NAME] || 'MyShare',
			}
		},
		fileStorage: {
			provider: processFileStorageProvider(process.env[CustomEnv.FILE_STORAGE_PROVIDER]) || 'awss3',
			s3: s3Config,
			azureStorage: {
				container: process.env[CustomEnv.AZURE_STORAGE_CONTAINER],
			}
		},
		frontend: {
			baseUrl: process.env[CustomEnv.FRONTEND_BASEURL] || 'http://localhost:3000',
		}
	}
}

const getBoolean = (value: any) => value === 'true';
const getInteger = (value: any) => !isNaN(value) ? parseInt(value) : undefined;
