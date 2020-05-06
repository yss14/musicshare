export const onShutdown = () => {
	return new Promise<void>((resolve) => {
		process.once("SIGINT", () => {
			console.info("Shutting down")
			resolve()
		})
	})
}
