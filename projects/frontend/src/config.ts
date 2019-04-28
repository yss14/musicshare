export interface IConfig {
	services: {
		musicshare: {
			backendURL: string;
			authTokenDev?: string;
		}
	}
}

const requiredEnvVars = [
	'REACT_APP_MUSICSHARE_BACKEND_URL'
];

export const makeConfigFromEnv = (): IConfig => {
	for (const requiredEnvVar of requiredEnvVars) {
		if (process.env[requiredEnvVar] === undefined) {
			throw new Error(`Missing environment variable ${requiredEnvVar}`);
		}
	}

	return {
		services: {
			musicshare: {
				backendURL: process.env.REACT_APP_MUSICSHARE_BACKEND_URL!,
				authTokenDev: process.env.REACT_APP_MUSICSHARE_BACKEND_AUTH_TOKEN_DEV
			}
		}
	}
}