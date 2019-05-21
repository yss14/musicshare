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
	}
}

const requiredEnvVars = [CustomEnv.JWT_SECRET];

export const configFromEnv = (): IConfig => {
	for (const requiredEnvVar of requiredEnvVars) {
		if (process.env[requiredEnvVar] === undefined) {
			throw new Error(`Required environment variable ${requiredEnvVar} is missing`);
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
		}
	}
}

const getBoolean = (value: any) => value === 'true';
