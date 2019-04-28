import { ISongService } from '../services/SongService';
import { FileService } from '../file-service/FileService';
import { ISongMetaDataService } from '../utils/song-meta/SongMetaDataService';
import { IFile } from '../models/interfaces/IFile';
import * as BetterQueue from 'better-queue';
import bind from 'bind-decorator';
import { TimeUUID } from '../types/TimeUUID';
import { types as CTypes } from 'cassandra-driver';
import { ISongTypeService } from '../services/SongTypeService';

export interface ISongProcessingQueuePayload {
	file: IFile;
	userID: string;
	shareID: string;
}

const isSongProcessingQueuePayload = (obj: any): obj is ISongProcessingQueuePayload => {
	const requiredProperties: (keyof ISongProcessingQueuePayload)[] =
		['userID', 'shareID', 'file'];
	const requiredPropertiesFile: (keyof IFile)[] =
		['container', 'blob', 'originalFilename', 'fileExtension'];

	return !requiredProperties.some(prop => !(prop in obj)) && !requiredPropertiesFile.some(prop => !(prop in obj.file));
}

export interface ISongUploadProcessingQueue {
	enqueueUpload(uploadMeta: ISongProcessingQueuePayload): Promise<string>;
}

export class SongUploadProcessingQueue implements ISongUploadProcessingQueue {
	private readonly jobQueue: BetterQueue;

	constructor(
		private readonly songService: ISongService,
		private readonly fileService: FileService,
		private readonly songMetaDataService: ISongMetaDataService,
		private readonly songTypeService: ISongTypeService,
	) {
		this.jobQueue = new BetterQueue<ISongProcessingQueuePayload, string>(this.process);
	}

	public enqueueUpload(uploadMeta: ISongProcessingQueuePayload) {
		return new Promise<string>((resolve, reject) => {
			this.jobQueue.push(uploadMeta, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	}

	@bind
	private async process(uploadMeta: ISongProcessingQueuePayload, callback: BetterQueue.ProcessFunctionCb<string>): Promise<void> {
		console.log(uploadMeta);
		if (!isSongProcessingQueuePayload(uploadMeta)) {
			return callback(new Error('Received job queue payload is no ISongProcessingQueuePayload, skip processing...'));
		}

		try {
			const audioBuffer = await this.fileService.getFileAsBuffer(uploadMeta.file.blob);
			const songTypes = await this.songTypeService.getSongTypesForShare(uploadMeta.shareID);

			const songMeta = await this.songMetaDataService.analyse(uploadMeta.file, audioBuffer, songTypes);

			console.log('create')
			const song = await this.songService.create({
				id: TimeUUID(),
				title: songMeta.title || uploadMeta.file.originalFilename,
				suffix: songMeta.suffix || null,
				year: songMeta.year,
				bpm: songMeta.bpm || null,
				date_last_edit: new Date(),
				release_date: songMeta.releaseDate ? CTypes.LocalDate.fromDate(new Date(songMeta.releaseDate)) : null,
				is_rip: songMeta.isRip || false,
				artists: [...(songMeta.artists || [])],
				remixer: [...(songMeta.remixer || [])],
				featurings: [...(songMeta.featurings || [])],
				type: songMeta.type || null,
				genres: [...(songMeta.genres || [])],
				label: songMeta.label || null,
				share_id: TimeUUID(uploadMeta.shareID.toString()),
				requires_user_action: !songMeta.title || songMeta.title.trim().length === 0 || !songMeta.artists || songMeta.artists.length === 0,
				file: JSON.stringify(uploadMeta.file)
			});

			return callback(undefined, song);
		} catch (err) {
			console.error(err);

			return callback(err);
		}
	}
}