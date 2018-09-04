import { genres } from './../database/fixtures';
import { Database } from './../database/database';
import { BlobService, IUploadMeta } from './../server/file-uploader';
import * as BeeQueue from 'bee-queue';
import { IUploadSongMeta } from '../server/file-uploader';
import { SongMeta } from '../utils/id3-parser';
import { SongService } from '../services/song.service';
import { types as CTypes } from 'cassandra-driver';

export class SongProcessingQueue {
	private beeQueue: BeeQueue;
	private fileUploadService: BlobService;

	constructor(
		private readonly songService: SongService,
		private readonly database: Database
	) {
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
		console.log(uploadMeta);

		const audioBuffer = await this.fileUploadService.getFile(uploadMeta.container, uploadMeta.blob);

		const songMeta = await SongMeta.analyse(uploadMeta.originalFilename, uploadMeta.fileExtension, audioBuffer);

		const file: IUploadMeta = {
			container: uploadMeta.container,
			blob: uploadMeta.blob,
			fileExtension: uploadMeta.fileExtension,
			originalFilename: uploadMeta.originalFilename
		};

		const songID = await this.songService.create({
			title: songMeta.title,
			suffix: songMeta.suffix,
			year: songMeta.year,
			bpm: songMeta.bpm,
			date_last_edit: Date.now(),
			release_date: new Date(songMeta.releaseDate),
			is_rip: songMeta.isRip,
			artists: [...(songMeta.artists || [])],
			remixer: [...(songMeta.remixer || [])],
			featurings: [...(songMeta.featurings || [])],
			type: songMeta.type,
			genres: [songMeta.genre],
			label: songMeta.label,
			share_id: CTypes.TimeUuid.fromString(uploadMeta.shareID),
			needs_user_action: songMeta.title === null || songMeta.title.trim().length === 0 || songMeta.artists.size === 0,
			file: JSON.stringify(file)
		});
	}
}