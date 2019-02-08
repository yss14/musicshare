import { FileService, UploadFileArgs, GetLinkToFileArgs } from "./FileService";
import * as azBlob from 'azure-storage';
import moment = require("moment");
import { ICreateBlockBlobRequestOptions } from "../types/azure-storage-additional-types";
import { streamToBuffer } from "../utils/stream-to-buffer";

export enum ContainerAccessLevel {
	Private = 'off',
	Blob = 'blob',
	Container = 'container'
}

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

		await fileService.createContainerIfNotExists();

		return fileService;
	}

	private createContainerIfNotExists() {
		return new Promise<void>((resolve, reject) => {
			this.blobStorage.createContainerIfNotExists(this.container, (err) => {
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

	public getLinkToFile(args: GetLinkToFileArgs): Promise<string> {
		const expireStartDate = moment();
		const expireEndDate = moment(args.expireDate || moment());
		const ipAddressRestriction = args.ipAddress || '0.0.0.0-255.255.255.255';

		const sharedAccessPolicy: azBlob.common.SharedAccessPolicy = {
			AccessPolicy: {
				Permissions: azBlob.Constants.AccountSasConstants.Permissions.READ,
				Start: expireStartDate.toDate(),
				Expiry: expireEndDate.toDate(),
				IPAddressOrRange: ipAddressRestriction
			}
		};

		const sharedAccessSignature = this.blobStorage.generateSharedAccessSignature(
			this.container, args.filenameRemote, sharedAccessPolicy);

		const url = this.blobStorage.getUrl(this.container, args.filenameRemote, sharedAccessSignature);

		return Promise.resolve(url);
	}

	public getFileAsBuffer(filenameRemote: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			const stream = this.blobStorage.createReadStream(this.container, filenameRemote, (err) => {
				if (err) {
					return reject(err);
				}
			});

			if (stream) {
				resolve(streamToBuffer(stream));
			} else {
				reject(new Error('Stream is not valid'));
			}
		});
	}
}