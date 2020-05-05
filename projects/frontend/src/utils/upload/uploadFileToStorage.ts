import {
	BlockBlobURL,
	BlobURL,
	AnonymousCredential,
	StorageURL,
	uploadBrowserDataToBlockBlob,
	Aborter,
	IUploadToBlockBlobOptions,
} from "@azure/storage-blob"
import axios from "axios"

type TransferProgressEvent = {
	loadedBytes: number
}

interface IAxiosProgress {
	total?: number
	loaded?: number
}

export interface IUploadFileToStorageArgs {
	targetFileUrl: string
	blob: Blob
	contentType: string
	onProgress: (progress: number) => void
}

export const uploadFileToAzureBlob = async ({
	targetFileUrl,
	blob,
	contentType,
	onProgress,
}: IUploadFileToStorageArgs) => {
	const anonymousCredential = new AnonymousCredential()
	const pipeline = StorageURL.newPipeline(anonymousCredential)
	const blobUrl = new BlobURL(targetFileUrl, pipeline)
	const blockBlobUrl = BlockBlobURL.fromBlobURL(blobUrl)

	const handleProgress = ({ loadedBytes }: TransferProgressEvent) => {
		const progress = (loadedBytes / blob.size) * 100

		onProgress(progress)
	}

	const blobOptions: IUploadToBlockBlobOptions = {
		blobHTTPHeaders: { blobContentType: contentType },
		progress: handleProgress,
	}

	await uploadBrowserDataToBlockBlob(Aborter.none, blob, blockBlobUrl, blobOptions)
}

export const uploadFileToS3 = async ({ targetFileUrl, blob, contentType, onProgress }: IUploadFileToStorageArgs) => {
	const handleProgress = ({ total, loaded }: IAxiosProgress) => {
		if (total && loaded) {
			onProgress(loaded / total)
		}
	}

	await axios.put(targetFileUrl, blob, {
		headers: {
			"Content-Type": contentType,
		},
		onUploadProgress: handleProgress,
	})
}

export const uploadFileToStorage = (args: IUploadFileToStorageArgs) => {
	const targetFileUrl = args.targetFileUrl

	if (targetFileUrl.indexOf("X-Amz-Algorithm") > -1 && targetFileUrl.indexOf("X-Amz-Signature") > -1) {
		return uploadFileToS3(args)
	}

	return uploadFileToAzureBlob(args)
}
