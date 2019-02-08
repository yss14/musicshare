import { FileService, UploadFileArgs, GetLinkToFileArgs } from "../../file-service/FileService";

export class FileServiceMock implements FileService {
	constructor(
		private readonly uploadHook: () => void,
		private readonly getLinkToFileHook: () => string,
	) { }

	public async uploadFile(args: UploadFileArgs): Promise<void> {
		this.uploadHook();
	}

	public async getLinkToFile(args: GetLinkToFileArgs): Promise<string> {
		return this.getLinkToFileHook();
	}

	public getFileAsBuffer(filenameRemote: string): Promise<Buffer> {
		return Promise.resolve(new Buffer('somecontent'));
	}
}