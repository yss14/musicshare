import { ISongService } from '../services/SongService';
import { IFileService } from '../file-service/FileService';
import { ISongMetaDataService } from '../utils/song-meta/SongMetaDataService';
import { IFile } from '../models/interfaces/IFile';
import BetterQueue from 'better-queue';
import bind from 'bind-decorator';
import { v4 as uuid } from 'uuid';
import { ISongTypeService } from '../services/SongTypeService';
import { IPlaylistService } from '../services/PlaylistService';
import { makeFileSourceJSONType } from '../models/FileSourceModels';
import { ILogger, Logger } from '../utils/Logger';
import { IDatabaseClient } from 'postgres-schema-builder';
import { FileUploadLogsTable } from '../database/tables';

export interface ISongProcessingQueuePayload {
	file: IFile;
	userID: string;
	shareID: string;
	playlistIDs: string[];
}

const writeLogToDatabase = FileUploadLogsTable.insertFromObj

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
	private readonly logger: ILogger = Logger('SongUploadQueue');

	constructor(
		private readonly songService: ISongService,
		private readonly fileService: IFileService,
		private readonly songMetaDataService: ISongMetaDataService,
		private readonly songTypeService: ISongTypeService,
		private readonly playlistService: IPlaylistService,
		private readonly database: IDatabaseClient,
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
		if (!isSongProcessingQueuePayload(uploadMeta)) {
			return callback(new Error('Received job queue payload is no ISongProcessingQueuePayload, skip processing...'));
		}

		this.logger.log(JSON.stringify(uploadMeta))

		try {
			const audioBuffer = await this.fileService.getFileAsBuffer(uploadMeta.file.blob);
			const songTypes = await this.songTypeService.getSongTypesForShare(uploadMeta.shareID);

			const songMeta = await this.songMetaDataService.analyse(uploadMeta.file, audioBuffer, songTypes);

			const song = await this.songService.create(uploadMeta.shareID, {
				song_id: uuid(),
				title: songMeta.title || uploadMeta.file.originalFilename,
				suffix: songMeta.suffix || null,
				year: songMeta.year || null,
				bpm: songMeta.bpm || null,
				date_last_edit: new Date(),
				release_date: songMeta.releaseDate ? new Date(songMeta.releaseDate) : null,
				is_rip: songMeta.isRip || false,
				artists: [...(songMeta.artists || [])],
				remixer: [...(songMeta.remixer || [])],
				featurings: [...(songMeta.featurings || [])],
				type: songMeta.type || null,
				genres: [...(songMeta.genres || [])],
				labels: songMeta.labels || [],
				requires_user_action: !songMeta.title || songMeta.title.trim().length === 0 || !songMeta.artists || songMeta.artists.length === 0,
				sources: makeFileSourceJSONType(uploadMeta.file),
				duration: songMeta.duration || 0,
				tags: [],
				date_added: new Date(),
				date_removed: null,
			});

			for (const playlistID of uploadMeta.playlistIDs) {
				try {
					await this.playlistService.addSongs(uploadMeta.shareID, playlistID, [song])
				} catch (err) {
					console.error(err);
				}
			}

			await this.database.query(writeLogToDatabase({
				file: uploadMeta,
				meta: songMeta,
				user_id_ref: uploadMeta.userID,
			}))

			return callback(undefined, song);
		} catch (err) {
			console.error(err);

			await this.database.query(writeLogToDatabase({
				file: uploadMeta,
				error: err,
				user_id_ref: uploadMeta.userID,
			}))

			return callback(err);
		}
	}
}