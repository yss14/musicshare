import { Readable } from "stream";
import { Moment } from "moment";

export interface UploadFileArgs {
	filenameRemote: string;
	contentType: string;
	source: Readable;
}

export interface GetLinkToFileArgs {
	filenameRemote: string;
	expireDate?: Moment | Date;
	ipAddress?: string;
}

export interface FileService {
	uploadFile(args: UploadFileArgs): Promise<void>;
	getLinkToFile(args: GetLinkToFileArgs): Promise<string>;
	getFileAsBuffer(filenameRemote: string): Promise<Buffer>;
	createContainerIfNotExists(): Promise<void>;

	readonly container: string;
}