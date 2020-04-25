import { UPLOAD_FINISHED, UPLOAD_PROGRESS, UPLOAD_QUEUED, UPLOAD_REMOVE, UPLOAD_STARTED } from "./constants"
import { IUploadItem } from "../../graphql/rest-types"

export interface IUploadQueued {
	type: typeof UPLOAD_QUEUED
	payload: IUploadItem
}

export interface IUploadStarted {
	type: typeof UPLOAD_STARTED
	payload: {
		fileHash: string
	}
}

export interface IUploadProgress {
	type: typeof UPLOAD_PROGRESS
	payload: {
		fileHash: string
		progress: number
	}
}

export interface IUploadFinished {
	type: typeof UPLOAD_FINISHED
	payload: {
		fileHash: string
		success: boolean
	}
}

export interface IUploadRemove {
	type: typeof UPLOAD_REMOVE
	payload: {
		fileHash: string
	}
}

export type UploadAction = IUploadQueued | IUploadStarted | IUploadProgress | IUploadFinished | IUploadRemove
