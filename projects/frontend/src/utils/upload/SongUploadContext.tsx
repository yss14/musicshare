import React, { useReducer, useContext } from "react"

export enum UploadItemStatus {
	Queued = "queued",
	Uploading = "uploading",
	Uploaded = "uploaded",
	Failed = "failed",
}

export interface ISongUploadItem {
	id: string
	filename: string
	size: number
	progress: number
	status: UploadItemStatus
	shareID: string
	hash: string
	playlistID?: string
}

type IAddUpload = ReturnType<typeof addUpload>

export const addUpload = (item: ISongUploadItem) => ({
	type: "upload_queued" as const,
	payload: item,
})

type IUploadStart = ReturnType<typeof uploadStart>

export const uploadStart = (id: string) => ({
	type: "upload_start" as const,
	payload: id,
})

type IUploadProgress = ReturnType<typeof uploadProgress>

export const uploadProgress = (id: string, progress: number) => ({
	type: "upload_progress" as const,
	payload: { id, progress },
})

type IUploadFinish = ReturnType<typeof uploadFinish>

export const uploadFinish = (id: string, success: boolean) => ({
	type: "upload_finish" as const,
	payload: { id, success },
})

type IUploadRemove = ReturnType<typeof uploadRemove>

export const uploadRemove = (id: string) => ({
	type: "upload_remove" as const,
	payload: id,
})

type UploadAction = IAddUpload | IUploadStart | IUploadProgress | IUploadFinish | IUploadRemove

const reducer = (state: ISongUploadItem[] = [], action: UploadAction) => {
	switch (action.type) {
		case "upload_queued":
			return state.concat(action.payload)

		case "upload_start":
			return state.map((upload) =>
				upload.id === action.payload ? { ...upload, status: UploadItemStatus.Uploading } : upload,
			)

		case "upload_progress":
			return state.map((upload) =>
				upload.id === action.payload.id ? { ...upload, progress: action.payload.progress } : upload,
			)

		case "upload_finish":
			return state.map((upload) =>
				upload.id === action.payload.id
					? {
							...upload,
							status: action.payload.success ? UploadItemStatus.Uploaded : UploadItemStatus.Failed,
					  }
					: upload,
			)

		case "upload_remove":
			return state.filter((upload) => upload.id !== action.payload)

		default:
			return state
	}
}

type ISongUploadContext = [ISongUploadItem[], React.Dispatch<UploadAction>]

const SongUploadContext = React.createContext<ISongUploadContext | null>(null)

export const SongUploadProvider: React.FC = ({ children }) => {
	const context = useReducer(reducer, [])

	return <SongUploadContext.Provider value={context}>{children}</SongUploadContext.Provider>
}

export const useSongUploadQueue = () => {
	const contextValue = useContext(SongUploadContext)

	if (!contextValue) {
		throw new Error(`useSongUploadQueue() can only be used inside SongUploadProvider`)
	}

	return contextValue
}
