export enum UploadItemType {
	Song,
	Cover,
}

export enum UploadItemStatus {
	Queued,
	Uploading,
	Uploaded,
	Failed,
}

export interface IUploadItem {
	type: UploadItemType
	filename: string
	size: number
	progress: number
	status: UploadItemStatus
	shareID: string
	hash: string
}

export type IUploadSchema = IUploadItem[]
