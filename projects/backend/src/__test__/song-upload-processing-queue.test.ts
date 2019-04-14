// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { SongServiceMock } from "./mocks/SongServiceMock";
import { FileServiceMock } from "./mocks/FileServiceMock";
import { ISongMetaDataService } from "../utils/song-meta/SongMetaDataService";
import { SongUploadProcessingQueue, ISongProcessingQueuePayload } from "../job-queues/SongUploadProcessingQueue";
import { TimeUUID } from "../types/TimeUUID";
import { SongTypeServiceMock } from "./mocks/SongTypeServiceMock";

const setupTestEnv = () => {
	const songService = new SongServiceMock();
	const fileService = new FileServiceMock(() => undefined, () => '');
	const songMetaDataService: ISongMetaDataService = { analyse: async () => ({}) };
	const songTypeServiceMock = SongTypeServiceMock();

	const songUploadProcessingQueue = new SongUploadProcessingQueue(songService, fileService, songMetaDataService, songTypeServiceMock);

	return { songService, fileService, songMetaDataService, songUploadProcessingQueue };
}

const makeValidPayload = (): ISongProcessingQueuePayload => ({
	file: { blob: 'somefile', container: 'songs', fileExtension: 'mp3', originalFilename: 'somefile' },
	shareID: TimeUUID(new Date()).toString(),
	userID: TimeUUID(new Date()).toString()
})

test('upload successful', async () => {
	const { songUploadProcessingQueue } = setupTestEnv();
	const payload = makeValidPayload();

	const result = await songUploadProcessingQueue.enqueueUpload(payload);

	expect(result).toBeString();
	expect(result.length).toBeGreaterThan(0);
});

test('wrong payload format', async () => {
	const { songUploadProcessingQueue } = setupTestEnv();
	const payload: any = {
		file: { blob: 'somefile', container: 'songs', fileExtension: 'mp3', originalFilename: 'somefile' },
		shareID: TimeUUID(new Date()).toString(),
	}

	await expect(songUploadProcessingQueue.enqueueUpload(payload))
		.rejects.toThrow('Received job queue payload is no ISongProcessingQueuePayload, skip processing...');
});

test('meta data error', async () => {
	const { songUploadProcessingQueue, songMetaDataService } = setupTestEnv();
	songMetaDataService.analyse = async () => { throw 'Cannot read property title of undefined' };
	const payload = makeValidPayload();

	await expect(songUploadProcessingQueue.enqueueUpload(payload))
		.rejects.toMatch('Cannot read property title of undefined');
});