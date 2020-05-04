import { Readable } from "stream"
import { Moment } from "moment"

export class InvalidBlobUrl extends Error {
	constructor(url: string) {
		super(`${url} is not a valid blob url`)
	}
}

export interface UploadFileArgs {
	filenameRemote: string
	contentType: string
	source: Readable
}

export type FileAccessPermission = "read" | "write"

export interface GetLinkToFileArgs {
	filenameRemote: string
	expireDate?: Moment | Date
	ipAddress?: string
	permission?: FileAccessPermission
}

export interface IFileService {
	uploadFile(args: UploadFileArgs): Promise<void>
	getLinkToFile(args: GetLinkToFileArgs): Promise<string>
	getFileAsBuffer(filenameRemote: string): Promise<Buffer>
	createContainerIfNotExists(): Promise<void>

	readonly container: string
}
