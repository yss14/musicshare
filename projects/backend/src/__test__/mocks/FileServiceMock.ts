import { IFileService, UploadFileArgs, GetLinkToFileArgs } from "../../file-service/FileService"

export class FileServiceMock implements IFileService {
	public readonly container: string = "mockcontainer"

	constructor(private readonly uploadHook: () => void, private readonly getLinkToFileHook: () => string) {}

	public async uploadFile(args: UploadFileArgs): Promise<void> {
		this.uploadHook()
	}

	public async getLinkToFile(args: GetLinkToFileArgs): Promise<string> {
		return this.getLinkToFileHook()
	}

	public async getFileAsBuffer(filenameRemote: string): Promise<Buffer> {
		return Buffer.from("somecontent")
	}

	public async createContainerIfNotExists(): Promise<void> {
		throw "Not implemented yet"
	}
}
