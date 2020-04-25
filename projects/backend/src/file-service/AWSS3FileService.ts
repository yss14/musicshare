import { IFileService, UploadFileArgs, GetLinkToFileArgs } from "./FileService"
import { S3 } from "aws-sdk"
import moment from "moment"

export class AWSS3FileService implements IFileService {
	constructor(private readonly s3Client: S3, private readonly bucket: string) {}

	public createContainerIfNotExists() {
		return new Promise<void>((resolve, reject) => {
			this.s3Client.headBucket({ Bucket: this.bucket }, (err) => {
				if (err && err.code === "NotFound") {
					this.s3Client.createBucket({ Bucket: this.bucket }, (err) => {
						if (err) return reject(err)

						return resolve()
					})
				} else if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
		})
	}

	public uploadFile({ contentType, filenameRemote, source }: UploadFileArgs): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.s3Client.upload(
				{
					Bucket: this.bucket,
					ContentType: contentType,
					Body: source,
					Key: filenameRemote,
				},
				(err) => {
					// istanbul ignore if
					if (err) return reject(err)

					return resolve()
				},
			)
		})
	}

	public getLinkToFile({ expireDate, filenameRemote, ipAddress }: GetLinkToFileArgs): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const expireSecond = Math.round(
				(moment(expireDate || moment().add(10, "minutes")).valueOf() - Date.now()) / 1000,
			)

			this.s3Client.getSignedUrl(
				"getObject",
				{ Bucket: this.bucket, Key: filenameRemote, Expires: expireSecond },
				(err, url) => {
					// istanbul ignore if
					if (err) return reject(err)

					resolve(url)
				},
			)
		})
	}

	public getFileAsBuffer(filenameRemote: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			this.s3Client.getObject({ Bucket: this.bucket, Key: filenameRemote }, (err, response) => {
				if (err) return reject(err)

				// istanbul ignore else
				if (response.Body instanceof Buffer) {
					return resolve(response.Body)
				} else {
					return reject(new Error(`Returned non-buffer response. Cannot get blob ${filenameRemote}`))
				}
			})
		})
	}

	public get container(): string {
		return this.bucket
	}
}
