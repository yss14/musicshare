import { blobToArrayBuffer } from "./blob-to-arraybuffer"
import * as crypto from "js-sha256"
import { last } from "lodash"
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
import { GenerateUploadableUrl } from "../../graphql/programmatic/generate-file-uploadable-url"
import { uploadFileToStorage } from "./uploadFileToStorage"
import { SubmitSongFromRemoteFile } from "../../graphql/programmatic/submit-song-from-remote-file"

let currentUploads: number = 0

export const uploadFile = (
	shareID: string,
	playlistIDs: string[],
	file: File,
	generateFileUploadableUrl: GenerateUploadableUrl,
	submitSongFromremoteFile: SubmitSongFromRemoteFile,
) => async (dispatch: any) => {
	const arrayBuffer = await blobToArrayBuffer(file)
	const hash = crypto.sha256(arrayBuffer)
	const id = uuid()
	const fileExtension = last(file.name.split("."))

	dispatch(
		addUpload({
			id,
			filename: file.name,
			size: arrayBuffer.byteLength,
			progress: 0,
			status: UploadItemStatus.Queued,
			shareID: shareID,
			hash: hash,
			playlistIDs,
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

	const onProgress = (progress: number) => {
		dispatch(uploadProgress(id, progress))
	}

	try {
		if (!fileExtension) {
			throw new Error(`Cannot read file extension from filename ${file.name}`)
		}

		const targetFileUrl = await generateFileUploadableUrl(fileExtension)

		currentUploads++

		await uploadFileToStorage({ blob: file, targetFileUrl, contentType: file.type, onProgress })
		await submitSongFromremoteFile({ filename: file.name, playlistIDs, remoteFileUrl: targetFileUrl })

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
