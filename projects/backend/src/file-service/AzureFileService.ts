import { IFileService, UploadFileArgs, GetLinkToFileArgs, FileAccessPermission } from "./FileService"
import * as azBlob from "azure-storage"
import moment from "moment"
import { ICreateBlockBlobRequestOptions } from "../types/azure-storage-additional-types"
import { streamToBuffer } from "../utils/stream-to-buffer"

const mapPermission = (permission: FileAccessPermission) => {
	switch (permission) {
		case "read":
			return azBlob.Constants.AccountSasConstants.Permissions.READ
		case "write":
			return azBlob.Constants.AccountSasConstants.Permissions.WRITE
	}
}

export enum ContainerAccessLevel {
	Private = "off",
	Blob = "blob",
	Container = "container",
}

export interface UploadFileArgsAzure extends UploadFileArgs {
	opts?: ICreateBlockBlobRequestOptions
}

export class AzureFileService implements IFileService {
	private readonly blobStorage: azBlob.BlobService
	public readonly container: string
	private readonly browserHost?: string

	constructor(container: string, blobStorage?: azBlob.BlobService, browserHost?: string) {
		this.container = container
		this.browserHost = browserHost

		if (blobStorage) {
			this.blobStorage = blobStorage
		} else {
			this.blobStorage = azBlob.createBlobService()
		}
	}

	public createContainerIfNotExists() {
		return new Promise<void>((resolve, reject) => {
			this.blobStorage.createContainerIfNotExists(this.container, (err) => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
		})
	}

	public uploadFile(args: UploadFileArgsAzure): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const blobOptions = this.makeContentOptions(args.contentType, args.opts)

			const destinationStream = this.blobStorage.createWriteStreamToBlockBlob(
				this.container,
				args.filenameRemote,
				blobOptions,
				(err) => {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				},
			)

			args.source.pipe(destinationStream)
		})
	}

	private makeContentOptions(contentType: string, customOpts?: ICreateBlockBlobRequestOptions) {
		const opts: ICreateBlockBlobRequestOptions = {
			...customOpts,
			contentSettings: {
				contentType: contentType,
			},
		}

		return opts
	}

	public getLinkToFile(args: GetLinkToFileArgs): Promise<string> {
		const expireStartDate = moment()
		const expireEndDate = moment(args.expireDate || moment())
		const ipAddressRestriction = args.ipAddress || "0.0.0.0-255.255.255.255"
		const defaultPermission = azBlob.Constants.AccountSasConstants.Permissions.READ
		const permission = args.permission ? mapPermission(args.permission) : defaultPermission

		const sharedAccessPolicy: azBlob.common.SharedAccessPolicy = {
			AccessPolicy: {
				Permissions: permission,
				Start: expireStartDate.toDate(),
				Expiry: expireEndDate.toDate(),
				IPAddressOrRange: ipAddressRestriction,
			},
		}

		const sharedAccessSignature = this.blobStorage.generateSharedAccessSignature(
			this.container,
			args.filenameRemote,
			sharedAccessPolicy,
		)

		const url = this.blobStorage.getUrl(this.container, args.filenameRemote, sharedAccessSignature)

		if (this.browserHost) {
			const host = new URL(url).host
			return Promise.resolve(url.replace(new RegExp(host), this.browserHost))
		} else {
			return Promise.resolve(url)
		}
	}

	public getFileAsBuffer(filenameRemote: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			const stream = this.blobStorage.createReadStream(this.container, filenameRemote, (err) => {
				if (err) {
					return reject(err)
				}
			})

			resolve(streamToBuffer(stream))
		})
	}

	public removeFile(filenameRemote: string) {
		return new Promise<void>((resolve, reject) => {
			this.blobStorage.deleteBlobIfExists(this.container, filenameRemote, (err) => {
				if (err) {
					return reject(err)
				}

				resolve()
			})
		})
	}
}
