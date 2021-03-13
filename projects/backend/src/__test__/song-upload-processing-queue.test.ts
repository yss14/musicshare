import { SongServiceMock } from "./mocks/SongServiceMock"
import { FileServiceMock } from "./mocks/FileServiceMock"
import { ISongMetaDataService } from "../utils/song-meta/SongMetaDataService"
import { SongUploadProcessingQueue, ISongProcessingQueuePayload } from "../job-queues/SongUploadProcessingQueue"
import { v4 as uuid } from "uuid"
import { SongTypeServiceMock } from "./mocks/SongTypeServiceMock"
import { PlaylistServiceMock } from "./mocks/PlaylistServiceMock"
import { makeMockDatabase } from "postgres-schema-builder"
import { ShareServiceMock } from "./mocks/ShareServiceMock"
import { ShareQuota } from "../models/ShareQuotaModel"
import { GenreServiceMock } from "./mocks/GenreServiceMock"

const setupTestEnv = () => {
	const songService = new SongServiceMock()
	const songFileService = new FileServiceMock(
		() => undefined,
		() => "",
	)
	const songMetaDataService: ISongMetaDataService = { analyse: async () => ({}) }
	const playlistService = PlaylistServiceMock()
	const songTypeService = SongTypeServiceMock()
	const genreService = GenreServiceMock()
	const shareService = new ShareServiceMock([])
	const database = makeMockDatabase()

	const songUploadProcessingQueue = new SongUploadProcessingQueue(
		() =>
			({
				songService,
				songFileService,
				songMetaDataService,
				songTypeService,
				genreService,
				playlistService,
				shareService,
			} as any),
		database,
	)

	return {
		songService,
		songFileService,
		songMetaDataService,
		songUploadProcessingQueue,
		playlistService,
		shareService,
	}
}

const makeValidPayload = (): ISongProcessingQueuePayload => ({
	file: { blob: "somefile", container: "songs", fileExtension: "mp3", originalFilename: "somefile" },
	shareID: uuid(),
	userID: uuid(),
	playlistIDs: [uuid()],
})

test("upload successful", async () => {
	const { songUploadProcessingQueue, playlistService } = setupTestEnv()
	const payload = makeValidPayload()

	const result = await songUploadProcessingQueue.enqueueUpload(payload)

	expect(result).toBeString()
	expect(result.length).toBeGreaterThan(0)
	expect(playlistService.addSongs).toBeCalledTimes(1)
})

test("wrong payload format", async () => {
	const { songUploadProcessingQueue } = setupTestEnv()
	const payload: any = {
		file: { blob: "somefile", container: "songs", fileExtension: "mp3", originalFilename: "somefile" },
		shareID: uuid(),
	}

	await expect(songUploadProcessingQueue.enqueueUpload(payload)).rejects.toThrow(
		"Received job queue payload is no ISongProcessingQueuePayload, skip processing...",
	)
})

test("meta data error", async () => {
	const { songUploadProcessingQueue, songMetaDataService } = setupTestEnv()
	songMetaDataService.analyse = async () => {
		throw "Cannot read property title of undefined"
	}
	const payload = makeValidPayload()

	await expect(songUploadProcessingQueue.enqueueUpload(payload)).rejects.toMatch(
		"Cannot read property title of undefined",
	)
})

test("quota exceeds fails", async () => {
	const { songUploadProcessingQueue, shareService, songFileService } = setupTestEnv()
	shareService.getQuota = jest.fn(async () => <ShareQuota>{ quota: 10, used: 0 })
	songFileService.removeFile = jest.fn()
	const payload = makeValidPayload()

	const result = songUploadProcessingQueue.enqueueUpload(payload)

	await expect(result).rejects.toThrow("Quota of 10 B exceeded")
	expect(songFileService.removeFile).toBeCalled()
})
