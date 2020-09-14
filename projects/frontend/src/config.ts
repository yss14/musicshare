export interface IConfig {
	services: {
		musicshare: {
			backendURL: string
		}
	}
	settings: {
		publicRegistration: boolean
	}
}

const requiredEnvVars = ["REACT_APP_MUSICSHARE_BACKEND_URL"]

interface IEnvLike {
	[key: string]: string
}

interface IWindowWithEnv extends Window {
	_env_: IEnvLike
}

const isWindowWithEnv = (obj: Window): obj is IWindowWithEnv => typeof (obj as any)._env_ === "object"

const getEnvValue = (name: string): string => (isWindowWithEnv(window) ? window["_env_"][name] : process.env[name]!)

export const makeConfigFromEnv = (): IConfig => {
	for (const requiredEnvVar of requiredEnvVars) {
		if (getEnvValue(requiredEnvVar) === undefined) {
			throw new Error(`Missing environment variable ${requiredEnvVar}`)
		}
	}

	return {
		services: {
			musicshare: {
				backendURL: getEnvValue("REACT_APP_MUSICSHARE_BACKEND_URL"),
			},
		},
		settings: {
			publicRegistration: getEnvValue("REACT_APP_PUBLIC_REGISTRATION") === "true",
		},
	}
}
