export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const fileReader = new FileReader()

		fileReader.onload = (event: ProgressEvent) => {
			resolve((event.target as any).result)
		}

		fileReader.onerror = (err) => reject(err)

		fileReader.readAsArrayBuffer(blob)
	})
}
