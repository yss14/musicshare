import { CustomEnv } from "../utils/env/CustomEnv";
import { __PROD__ } from "../utils/env/env-constants";

export interface IConfig {
	database: {
		host: string;
		keyspace: string;
		user?: string;
		password?: string;
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
			dbCleanInit: boolean;
			dbSeed: boolean;
		}
	},
	fileStorage: {
		s3?: {
			host: string;
			accessKey: string;
			secretKey: string;
		}
	}
}

const requiredEnvVars = [CustomEnv.JWT_SECRET];

export const configFromEnv = (): IConfig => {
	for (const requiredEnvVar of requiredEnvVars) {
		if (process.env[requiredEnvVar] === undefined) {
			throw new Error(`Required environment variable ${requiredEnvVar} is missing`);
		}
	}

	let s3Config = undefined;

	if (process.env[CustomEnv.S3_ACCESS_KEY] && process.env[CustomEnv.S3_SECRET_KEY] && process.env[CustomEnv.S3_HOST]) {
		s3Config = {
			accessKey: process.env[CustomEnv.S3_ACCESS_KEY]!,
			secretKey: process.env[CustomEnv.S3_SECRET_KEY]!,
			host: process.env[CustomEnv.S3_HOST]!,
		}
	}

	return {
		database: {
			host: process.env[CustomEnv.CASSANDRA_HOST] || '127.0.0.1',
			keyspace: process.env[CustomEnv.CASSANDRA_KEYSPACE] || 'musicshare',
			password: process.env[CustomEnv.CASSANDRA_PASSWORD],
			user: process.env[CustomEnv.CASSANDRA_USER],
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
				dbCleanInit: getBoolean(process.env[CustomEnv.SETUP_CLEAN_INIT]) || false,
				dbSeed: getBoolean(process.env[CustomEnv.SETUP_SEED_DATABASE]) || false,
			}
		},
		fileStorage: {
			s3: s3Config
		}
	}
}

const getBoolean = (value: any) => value === 'true';
