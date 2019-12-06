export type ILogger = ReturnType<typeof Logger>

export const Logger = (namespace: string) => {
	const log = (message: any, target?: any) => {
		const finalMessage = `[${namespace}]: ${message && message.toString ? message.toString() : message}`

		if (target && typeof target === 'function') {
			target(finalMessage)
		} else {
			console.log(finalMessage)
		}
	}

	return {
		log,
	}
}