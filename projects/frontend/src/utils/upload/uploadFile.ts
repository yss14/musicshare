import React from "react"
import { last } from "lodash"
import { message } from "antd"
import {
	addUpload,
	UploadItemStatus,
	uploadStart,
	uploadProgress,
	uploadFinish,
	uploadRemove,
	UploadAction,
} from "./SongUploadContext"
import { uploadFileToStorage } from "./uploadFileToStorage"
import { GenerateUploadableUrl, SubmitSongFromRemoteFile } from "@musicshare/react-graphql-client"

let currentUploads: number = 0

export interface IUploadFileArgs {
	id: string
	shareID: string
	playlistIDs: string[]
	file: File
	hash: string
	buffer: ArrayBuffer
	generateUploadableUrl: GenerateUploadableUrl
	submitSongFromRemoteUrl: SubmitSongFromRemoteFile
	dispatch: React.Dispatch<UploadAction>
}

export const uploadFile = async ({
	id,
	file,
	hash,
	buffer,
	shareID,
	playlistIDs,
	generateUploadableUrl,
	submitSongFromRemoteUrl,
	dispatch,
}: IUploadFileArgs) => {
	const fileExtension = last(file.name.split("."))

	dispatch(
		addUpload({
			id,
			filename: file.name,
			size: buffer.byteLength,
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

		const targetFileUrl = await generateUploadableUrl({ fileExtension, fileSize: file.size })

		if (!targetFileUrl) {
			throw new Error(`No target file url was generated for file ${file.name}`)
		}

		currentUploads++

		await uploadFileToStorage({ blob: file, targetFileUrl, contentType: file.type, onProgress })
		await submitSongFromRemoteUrl({ input: { filename: file.name, playlistIDs, remoteFileUrl: targetFileUrl } })

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
