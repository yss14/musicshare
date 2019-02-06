import { Readable } from "stream";

export interface UploadFileArgs {
	filenameRemote: string;
	contentType: string;
	source: Readable;
}

export interface FileService {
	uploadFile(args: UploadFileArgs): Promise<void>;
}