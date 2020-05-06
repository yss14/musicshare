import { IDatabaseClient, SQL } from "postgres-schema-builder"
import { IServices } from "../services/services"
import BetterQueue from "better-queue"
import * as crypto from "crypto"
import { Tables } from "../database/tables"

export interface IBackgroundTaskArgs {
	database: IDatabaseClient
	services: IServices
}

export type IBackgroundTask = [() => Promise<void>, () => Promise<void>]

export const BackgroundTasks = (args: IBackgroundTaskArgs) => {
	const [startHashTask, stopHashTask] = CalcMissingSongUploadHashes(args)

	const start = async () => {
		await startHashTask()
	}

	const stop = async () => {
		await stopHashTask()
	}

	return [start, stop]
}

interface ICalcMissingSongUploadHashesPayload {
	blob: string
	songID: string
}

const CalcMissingSongUploadHashes = ({
	database,
	services: { songFileService },
}: IBackgroundTaskArgs): IBackgroundTask => {
	const jobHandler = async (
		job: ICalcMissingSongUploadHashesPayload,
		callback: BetterQueue.ProcessFunctionCb<string>,
	) => {
		const { blob, songID } = job

		const audioBuffer = await songFileService.getFileAsBuffer(blob)
		const hash = crypto.createHash("md5").update(audioBuffer).digest("hex")

		const results = await database.query(
			SQL.raw<typeof Tables.songs>(`SELECT * FROM songs WHERE song_id = $1 AND date_removed IS NULL`, [songID]),
		)

		if (results.length === 1) {
			const updatesSources = { data: results[0].sources.data.map((source) => ({ ...source, hash })) }

			await database.query(
				SQL.raw(
					`
			UPDATE songs SET sources = $1 WHERE song_id = $2;
		`,
					[updatesSources, songID],
				),
			)
		}

		console.info(`BackgroundTask processed hash of song ${songID}`)

		callback()
	}

	const jobQueue = new BetterQueue<ICalcMissingSongUploadHashesPayload, string>(jobHandler)

	const start = async () => {
		const results = await database.query(
			SQL.raw<typeof Tables.songs>(`SELECT * FROM songs WHERE date_removed IS NULL`, []),
		)
		const songsWithoutHash = results.filter(
			(result) =>
				result.sources.data.length > 0 &&
				result.sources.data.some((source) => typeof source.hash === "undefined"),
		)

		songsWithoutHash.forEach((song) => {
			const sourcesWithoutHash = song.sources.data.filter((source) => typeof source.hash === "undefined")

			sourcesWithoutHash.forEach((source) => {
				jobQueue.push({
					blob: source.blob,
					songID: song.song_id,
				})
			})
		})
	}

	const stop = async () => {
		await new Promise((resolve) => {
			jobQueue.destroy(resolve)
		})
	}

	return [start, stop]
}
