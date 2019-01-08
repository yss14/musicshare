import { streamToBuffer } from './../utils/stream-to-buffer';
import { SongMeta } from './../utils/id3-parser';
import { HTTPStatusCodes } from './../types/http-status-codes';
import { Request, Response } from 'express';
import { Service } from 'typedi';
import * as BodyParser from 'body-parser';
import * as azBlob from 'azure-storage';
import { Duplex, Readable } from 'stream';
import * as MimeType from 'mime-types';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import * as path from 'path';
import { ICreateBlockBlobRequestOptions } from './file-uploader-interfaces';
import { SongProcessingQueue } from '../job-queues/song-processing.queue';
import * as moment from 'moment';

interface IRawBodyRequest extends Request {
	rawBody: Buffer;
}

export interface IUploadMeta {
	container: string;
	blob: string;
	originalFilename: string;
	fileExtension: string;
}

export interface IUploadSongMeta extends IUploadMeta {
	userID: string;
	shareID: string;
}

@Service()
export class BlobService {

	private blobStorage: azBlob.BlobService;

	constructor(
		private readonly songProcessingQueue: SongProcessingQueue
	) {
		this.blobStorage = azBlob.createBlobService();
	}

	public createContainer(containerName: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.blobStorage.createContainer(containerName, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public getUploadRoute(): (req: Request, res: Response) => Promise<void> {
		return async (req: Request, res: Response) => {
			const stream = new Duplex();
			const fileBuffer = (req as IRawBodyRequest).rawBody;
			stream.push(fileBuffer);
			stream.push(null);

			const filename = decodeURI(path.basename(req.path));
			const contentType: string = req.get("content-type");
			const fileExtension = path.extname(filename).split('.').join('');

			const opts: ICreateBlockBlobRequestOptions = {
				contentSettings: {
					contentDisposition: req.get("content-disposition"),
					contentType: contentType,
					contentEncoding: req.get("content-encoding"),
				}
			};

			console.log((req as any).saveParams);

			const fileNameRemote = crypto.createHash('sha256').update(uuid() + fileBuffer.length).digest('hex') + '.' + fileExtension;

			const destinationStream = this.blobStorage.createWriteStreamToBlockBlob('songs', fileNameRemote, opts, (err) => {
				if (err) {
					console.error(err);
					return void (res.status(HTTPStatusCodes.UNPROCESSABLE_ENTITY).json({ error: err }));
				}

				this.songProcessingQueue.enqueueUpload(this, {
					container: 'songs',
					blob: fileNameRemote,
					originalFilename: filename,
					fileExtension: fileExtension,
					userID: (req as any).saveParams.userID || null,
					shareID: (req as any).saveParams.shareID || null
				});

				const fileUrl = this.blobStorage.getUrl('songs', fileNameRemote);

				res.status(HTTPStatusCodes.CREATED).json({ url: fileUrl });
			});

			stream.pipe(destinationStream);
		}
	}

	public getRawBodyParser(fileSizeLimit: number) {
		return BodyParser.raw({
			type: '*/*',
			limit: fileSizeLimit,
			verify(req, res, buf, encoding) {
				(<IRawBodyRequest>req).rawBody = buf;
			}
		});
	}

	public async getFile(container: string, blob: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			let stream = this.blobStorage.createReadStream(container, blob, (err) => {
				if (err) {
					reject(err);

					return;
				}
			});

			if (stream) {
				console.log('streamToBuffer')
				resolve(streamToBuffer(stream));
			} else {
				reject();
			}
		})
	}

	public getSharedAccessSignatur(container: string, blob: string, expireSeconds: number): string {
		const sharedAccessSignature = this.blobStorage.generateSharedAccessSignature(container, blob, {
			AccessPolicy: {
				Permissions: azBlob.Constants.AccountSasConstants.Permissions.READ,
				Start: new Date(),
				Expiry: moment().add(expireSeconds, 'seconds').toDate(),
				IPAddressOrRange: "0.0.0.0-255.255.255.255" //TODO take client IP address
			}
		});
		console.log('Url ', this.blobStorage.getUrl(container, blob, sharedAccessSignature));
		return this.blobStorage.getUrl(container, blob, sharedAccessSignature);
	}
}