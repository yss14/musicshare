import { FileService, UploadFileArgs } from "./FileService";
import { ICreateBlockBlobRequestOptions } from "../server/file-uploader-interfaces";
import * as azBlob from 'azure-storage';

export interface UploadFileArgsAzure extends UploadFileArgs {
	opts?: ICreateBlockBlobRequestOptions;
}

export class AzureFileService implements FileService {
	private readonly blobStorage: azBlob.BlobService;
	private readonly container: string;

	private constructor(container: string, blobStorage?: azBlob.BlobService) {
		this.container = container;

		if (blobStorage) {
			this.blobStorage = blobStorage;
		} else {
			this.blobStorage = azBlob.createBlobService();
		}
	}

	public static async makeService(container: string): Promise<AzureFileService>;
	public static async makeService(container: string, blobStorage?: azBlob.BlobService): Promise<AzureFileService> {
		const fileService = new AzureFileService(container, blobStorage);

		await fileService.createContainer();

		return fileService;
	}

	private createContainer() {
		return new Promise<void>((resolve, reject) => {
			this.blobStorage.createContainer(this.container, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public uploadFile(args: UploadFileArgsAzure): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const blobOptions = this.makeContentOptions(args.contentType, args.opts);

			const destinationStream = this.blobStorage.createWriteStreamToBlockBlob(this.container, args.filenameRemote, blobOptions, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});

			args.source.pipe(destinationStream);
		});
	}

	private makeContentOptions(contentType: string, customOpts?: ICreateBlockBlobRequestOptions) {
		const opts: ICreateBlockBlobRequestOptions = {
			...customOpts,
			contentSettings: {
				contentType: contentType
			}
		};

		return opts;
	}
}