import { IFile } from "../models/interfaces/IFile"
import BetterQueue from "better-queue"
import bind from "bind-decorator"
import { v4 as uuid } from "uuid"
import { makeFileSourceJSONType } from "../models/FileSourceModels"
import { ILogger, Logger } from "../utils/Logger"
import { IDatabaseClient } from "postgres-schema-builder"
import { FileUploadLogsTable } from "../database/tables"
import * as crypto from "crypto"
import { ServiceFactory } from "../services/services"
import prettyBytes from "pretty-bytes"

export interface ISongProcessingQueuePayload {
	file: IFile
	userID: string
	shareID: string
	playlistIDs: string[]
}

const writeLogToDatabase = FileUploadLogsTable.insertFromObj

const isSongProcessingQueuePayload = (obj: any): obj is ISongProcessingQueuePayload => {
	const requiredProperties: (keyof ISongProcessingQueuePayload)[] = ["userID", "shareID", "file"]
	const requiredPropertiesFile: (keyof IFile)[] = ["container", "blob", "originalFilename", "fileExtension"]

	return (
		!requiredProperties.some((prop) => !(prop in obj)) &&
		!requiredPropertiesFile.some((prop) => !(prop in obj.file))
	)
}

export interface ISongUploadProcessingQueue {
	enqueueUpload(uploadMeta: ISongProcessingQueuePayload): Promise<string>
}

export class SongUploadProcessingQueue implements ISongUploadProcessingQueue {
	private readonly jobQueue: BetterQueue<ISongProcessingQueuePayload, string>
	private readonly logger: ILogger = Logger("SongUploadQueue")

	constructor(private readonly serviceFactory: ServiceFactory, private readonly database: IDatabaseClient) {
		this.jobQueue = new BetterQueue(this.process)
	}

	public enqueueUpload(uploadMeta: ISongProcessingQueuePayload) {
		return new Promise<string>((resolve, reject) => {
			this.jobQueue.push(uploadMeta, (err, result) => {
				if (err) {
					reject(err)
				} else {
					resolve(result)
				}
			})
		})
	}

	@bind
	private async process(
		uploadMeta: ISongProcessingQueuePayload,
		callback: BetterQueue.ProcessFunctionCb<string>,
	): Promise<void> {
		const services = this.serviceFactory()

		if (!isSongProcessingQueuePayload(uploadMeta)) {
			return callback(
				new Error("Received job queue payload is no ISongProcessingQueuePayload, skip processing..."),
			)
		}

		this.logger.log(JSON.stringify(uploadMeta))

		try {
			console.info(`[SongUploadPrcoessingQueue] start processing of ${uploadMeta.file.originalFilename}`)
			const audioBuffer = await services.songFileService.getFileAsBuffer(uploadMeta.file.blob)
			const fileSize = Buffer.byteLength(audioBuffer)

			const shareQuota = await services.shareService.getQuota(uploadMeta.shareID)

			if (shareQuota.used + fileSize > shareQuota.quota) {
				await services.songFileService.removeFile(uploadMeta.file.blob)

				throw new Error(`Quota of ${prettyBytes(shareQuota.quota)} exceeded`)
			}

			const songTypes = await services.songTypeService.getSongTypesForShare(uploadMeta.shareID)

			console.info(`[SongUploadPrcoessingQueue] start analyzing id3 tags of ${uploadMeta.file.originalFilename}`)
			const songMeta = await services.songMetaDataService.analyse(uploadMeta.file, audioBuffer, songTypes)
			console.info(`[SongUploadPrcoessingQueue] done analyzing id3 tags of ${uploadMeta.file.originalFilename}`)

			console.info(`[SongUploadPrcoessingQueue] calculating hash of ${uploadMeta.file.originalFilename}`)
			const hash = crypto.createHash("md5").update(audioBuffer).digest("hex")
			console.info(`[SongUploadPrcoessingQueue] hash of ${uploadMeta.file.originalFilename} is ${hash}`)

			console.info(`[SongUploadPrcoessingQueue] saving song to database ${uploadMeta.file.originalFilename}`)
			const songID = await services.songService.create(uploadMeta.shareID, {
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
				requires_user_action:
					!songMeta.title ||
					songMeta.title.trim().length === 0 ||
					!songMeta.artists ||
					songMeta.artists.length === 0,
				sources: makeFileSourceJSONType({ ...uploadMeta.file, hash, fileSize }),
				duration: songMeta.duration || 0,
				tags: [],
				date_added: new Date(),
				date_removed: null,
			})

			await services.shareService.adjustQuotaUsed(uploadMeta.shareID, fileSize)

			for (const playlistID of uploadMeta.playlistIDs) {
				try {
					console.info(
						`[SongUploadPrcoessingQueue] adding song to playlist ${playlistID} ${uploadMeta.file.originalFilename}`,
					)
					await services.playlistService.addSongs(uploadMeta.shareID, playlistID, [songID])
				} catch (err) {
					console.error(err)
				}
			}

			console.info(`[SongUploadPrcoessingQueue] write log to database ${uploadMeta.file.originalFilename}`)
			await this.database.query(
				writeLogToDatabase({
					file: uploadMeta,
					meta: songMeta,
					user_id_ref: uploadMeta.userID,
				}),
			)

			return callback(undefined, songID)
		} catch (err) {
			console.error(err)

			try {
				await this.database.query(
					writeLogToDatabase({
						file: uploadMeta,
						error: err,
						user_id_ref: uploadMeta.userID,
					}),
				)
			} catch (err) {
				console.error(err)
			}

			return callback(err)
		} finally {
			console.info(`[SongUploadPrcoessingQueue] done processing of ${uploadMeta.file.originalFilename}`)
		}
	}
}
