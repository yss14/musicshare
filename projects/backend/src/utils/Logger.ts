import { __TEST__ } from "./env/env-constants"

export type ILogger = ReturnType<typeof Logger>

export const Logger = (namespace: string, logDuringTest: boolean = false) => {
	const log = (message: any, target?: any) => {
		if (__TEST__ && !logDuringTest) return

		const finalMessage = `[${namespace}]: ${message && message.toString ? message.toString() : message}`

		if (target && typeof target === "function") {
			target(finalMessage)
		} else {
			console.log(finalMessage)
		}
	}

	return {
		log,
	}
}
