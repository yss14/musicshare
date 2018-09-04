import { BlobService } from './../server/file-uploader';
import * as BeeQueue from 'bee-queue';
import { IUploadSongMeta } from '../server/file-uploader';
import { SongMeta } from '../utils/id3-parser';

export class SongProcessingQueue {
	private beeQueue: BeeQueue;
	private fileUploadService: BlobService;

	constructor() {
		this.beeQueue = new BeeQueue('song_processing');

		this.beeQueue.process(this.process.bind(this));
	}

	public enqueueUpload(fileUploadService: BlobService, uploadMeta: IUploadSongMeta): void {
		this.fileUploadService = fileUploadService;

		const job = this.beeQueue.createJob<IUploadSongMeta>(uploadMeta);

		job.on('succeeded', () => {
			console.info(`[SongProcessing] Job ${job.id} succeeded`);
		});

		job.on('failed', (err) => {
			console.error(`[SongProcessing] Job ${job.id} failed\n${err.stack}`);
		})

		job.save();
	}

	private async process(job: BeeQueue.Job): Promise<void> {
		const uploadMeta = job.data as IUploadSongMeta;

		const audioBuffer = await this.fileUploadService.getFile(uploadMeta.container, uploadMeta.blob);

		const songMeta = await SongMeta.analyse(uploadMeta.originalFilename, uploadMeta.fileExtension, audioBuffer);

		console.log(songMeta);
	}
}