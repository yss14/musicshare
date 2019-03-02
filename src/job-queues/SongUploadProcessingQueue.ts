import * as BeeQueue from 'bee-queue';
import { SongService } from '../services/SongService';
import { types as CTypes } from 'cassandra-driver';
import { FileService } from '../file-service/FileService';
import { SongMetaDataService } from '../utils/song-meta/SongMetaDataService';
import { IFile } from '../models/interfaces/IFile';

export interface ISongProcessingQueuePayload {
	file: IFile;
	userID: number;
	shareID: number;
}

const isSongProcessingQueuePayload = (obj: any): obj is ISongProcessingQueuePayload => {
	const requiredProperties: (keyof ISongProcessingQueuePayload)[] =
		['userID', 'shareID', 'file'];
	const requiredPropertiesFile: (keyof IFile)[] =
		['container', 'blob', 'originalFilename', 'fileExtension'];

	return !requiredProperties.some(prop => !(prop in obj)) && !requiredPropertiesFile.some(prop => !(prop in obj.file));
}

export interface ISongUploadProcessingQueue {
	enqueueUpload(uploadMeta: ISongProcessingQueuePayload): Promise<void>;
}

export class SongUploadProcessingQueue implements ISongUploadProcessingQueue {
	private readonly beeQueue: BeeQueue;

	constructor(
		private readonly songService: SongService,
		private readonly fileService: FileService,
		private readonly songMetaDataService: SongMetaDataService
	) {
		this.beeQueue = new BeeQueue('song_processing');

		this.beeQueue.process(this.process.bind(this));
	}

	public async enqueueUpload(uploadMeta: ISongProcessingQueuePayload) {
		const job = this.beeQueue.createJob<ISongProcessingQueuePayload>(uploadMeta);

		job.on('succeeded', () => {
			console.info(`[SongProcessing] Job ${job.id} succeeded`);
		});

		job.on('failed', (err) => {
			console.error(`[SongProcessing] Job ${job.id} failed\n${err.stack}`);
		})

		await job.save();
	}

	private async process(job: BeeQueue.Job): Promise<void> {
		if (!isSongProcessingQueuePayload(job.data)) {
			console.warn('Received job queue payload is no ISongProcessingQueuePayload, skip processing...');

			return;
		}

		const uploadMeta = job.data;

		const audioBuffer = await this.fileService.getFileAsBuffer(uploadMeta.file.blob);

		const songMeta = await this.songMetaDataService.analyse(uploadMeta.file, audioBuffer);

		await this.songService.create({
			title: songMeta.title || uploadMeta.file.originalFilename,
			suffix: songMeta.suffix,
			year: songMeta.year,
			bpm: songMeta.bpm,
			date_last_edit: Date.now(),
			release_date: songMeta.releaseDate ? new Date(songMeta.releaseDate) : null,
			is_rip: songMeta.isRip || false,
			artists: [...(songMeta.artists || [])],
			remixer: [...(songMeta.remixer || [])],
			featurings: [...(songMeta.featurings || [])],
			type: songMeta.type,
			genres: [...(songMeta.genres || [])],
			label: songMeta.label,
			share_id: CTypes.TimeUuid.fromString(uploadMeta.shareID.toString()),
			needs_user_action: !songMeta.title || songMeta.title.trim().length === 0 || !songMeta.artists || songMeta.artists.length === 0,
			file: JSON.stringify(uploadMeta.file)
		});
	}
}