import { blobToArrayBuffer } from "./blob-to-arraybuffer"
import * as crypto from "js-sha256"
import { upload } from "./upload"
import { IConfig } from "../../config"
import { message } from "antd"
import {
	addUpload,
	UploadItemStatus,
	uploadStart,
	uploadProgress,
	uploadFinish,
	uploadRemove,
} from "./SongUploadContext"
import { v4 as uuid } from "uuid"

interface IAxiosProgress {
	total?: number
	loaded?: number
}

let currentUploads: number = 0

export const uploadFile = (
	userID: string,
	shareID: string,
	playlistIDs: string[],
	file: File,
	config: IConfig,
) => async (dispatch: any) => {
	const arrayBuffer = await blobToArrayBuffer(file)
	const hash = crypto.sha256(arrayBuffer)
	const id = uuid()

	dispatch(
		addUpload({
			id,
			filename: file.name,
			size: arrayBuffer.byteLength,
			progress: 0,
			status: UploadItemStatus.Queued,
			shareID: shareID,
			hash: hash,
		}),
	)

	await new Promise<void>((resolve) => {
		const checkIntervall = setInterval(() => {
			if (currentUploads <= 1) {
				clearInterval(checkIntervall)

				resolve()
			}
		}, 500)
	})

	dispatch(uploadStart(id))

	const onProgress = (progress: IAxiosProgress) => {
		if (progress.loaded && progress.total) {
			dispatch(uploadProgress(id, (progress.loaded / progress.total) * 100))
		}
	}

	try {
		currentUploads++

		await upload(userID, shareID, playlistIDs, file, arrayBuffer, onProgress, config)

		dispatch(uploadFinish(id, true))

		message.success(`File ${file.name} successfully uploaded`)
	} catch (err) {
		console.error(err)

		dispatch(uploadFinish(id, false))

		message.error(`File ${file.name} upload failed`)
	} finally {
		currentUploads--

		setTimeout(() => {
			dispatch(uploadRemove(id))
		}, 2000)
	}
}
