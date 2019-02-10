import * as path from 'path';
import { FileServiceMock } from './mocks/FileServiceMock';
import { promises as fsPromises } from 'fs';
import { fileUploadRouter, fileUploadErrors } from '../server/routes/file-upload-route';
import { makeExpressApp } from './utils/make-express-app';
import * as request from 'supertest';
import { HTTPStatusCodes } from '../types/http-status-codes';
import { commonRestErrors } from '../utils/typed-express/common-rest-errors';
import { SongUploadProcessingQueueMock } from './mocks/SongUploadProcessingQueueMock';

const mp3FilePath = path.join(__dirname, 'assets', 'SampleAudio.mp3');
let mp3FileBuffer: Buffer;
const acceptedContentTypes = ['audio/mpeg'];

const passingFileService = new FileServiceMock(
	() => undefined,
	() => ''
);
const songUploadProcessingQueue = new SongUploadProcessingQueueMock();
const defaultRestRouter = fileUploadRouter(passingFileService, songUploadProcessingQueue, 10 * 1024 * 1024, acceptedContentTypes);
const defaultExpressApp = makeExpressApp({ routers: [defaultRestRouter] });

beforeAll(async () => {
	mp3FileBuffer = await fsPromises.readFile(mp3FilePath);
});

test('valid request', async (done) => {
	const httpRequest = request(defaultExpressApp)
		.post('/users/2/shares/42/files')
		.set('Content-Type', 'audio/mpeg');

	httpRequest.write(mp3FileBuffer);
	httpRequest.end((err, res) => {
		if (err) throw err;

		expect(res.status).toBe(HTTPStatusCodes.CREATED);

		done();
	});
});

test('invalid request passing a json', async (done) => {
	const httpRequest = request(defaultExpressApp)
		.post('/users/2/shares/42/files')
		.set('Content-Type', 'application/json');

	httpRequest.send(JSON.stringify({ someProp: 42 }));
	httpRequest.end((err, res) => {
		if (err) throw err;

		expect(res.status).toBe(HTTPStatusCodes.BAD_REQUEST);
		expect(res.body.error).toEqual(fileUploadErrors.bodyNoValidByteBuffer);

		done();
	});
});

test('invalid request passing too large file', async (done) => {
	let tooLargeFileBuffer = mp3FileBuffer;

	while (tooLargeFileBuffer.length < 11 * 1024 * 1024) {
		tooLargeFileBuffer = Buffer.concat([tooLargeFileBuffer, tooLargeFileBuffer]);
	}

	const httpRequest = request(defaultExpressApp)
		.post('/users/2/shares/42/files')
		.set('Content-Type', 'audio/mpeg');

	httpRequest.write(tooLargeFileBuffer);
	httpRequest.end((err, res) => {
		if (err) throw err;

		expect(res.status).toBe(HTTPStatusCodes.REQUEST_ENTITY_TOO_LARGE);

		done();
	});
});

test('invalid request passing invalid userID', async () => {
	const response1 = await request(defaultExpressApp)
		.post('/users/true/shares/42/files')
		.set('Content-Type', 'audio/mpeg')
		.send();

	const response2 = await request(defaultExpressApp)
		.post('/users/somestring/shares/42/files')
		.set('Content-Type', 'audio/mpeg')
		.send();

	expect(response1.status).toBe(HTTPStatusCodes.BAD_REQUEST);
	expect(response2.status).toBe(HTTPStatusCodes.BAD_REQUEST);

	expect(response1.body.error).toEqual(fileUploadErrors.paramUserIDNotValid);
	expect(response2.body.error).toEqual(fileUploadErrors.paramUserIDNotValid);
});

test('invalid request passing invalid shareID', async () => {
	const response1 = await request(defaultExpressApp)
		.post('/users/42/shares/false/files')
		.set('Content-Type', 'audio/mpeg')
		.send();

	const response2 = await request(defaultExpressApp)
		.post('/users/42/shares/somestring/files')
		.set('Content-Type', 'audio/mpeg')
		.send();

	expect(response1.status).toBe(HTTPStatusCodes.BAD_REQUEST);
	expect(response2.status).toBe(HTTPStatusCodes.BAD_REQUEST);

	expect(response1.body.error).toEqual(fileUploadErrors.paramShareIDNotValid);
	expect(response2.body.error).toEqual(fileUploadErrors.paramShareIDNotValid);
});

test('invalid request passing no content-type', async (done) => {
	const httpRequest = request(defaultExpressApp)
		.post('/users/2/shares/42/files')

	httpRequest.write(mp3FileBuffer);
	httpRequest.end((err, res) => {
		if (err) throw err;

		expect(res.status).toBe(HTTPStatusCodes.BAD_REQUEST);
		// due to how BodyParser.raw() works, the buffer is not handled, and thus the body invalid error is thrown
		expect(res.body.error).toEqual(fileUploadErrors.bodyNoValidByteBuffer);

		done();
	});
});

test('valid request, but file upload fails', async (done) => {
	const failingFileService = new FileServiceMock(
		() => { throw new Error('Some went wrong during the file upload') },
		() => ''
	);
	const restRouter = fileUploadRouter(failingFileService, songUploadProcessingQueue, 10 * 1024 * 1024, acceptedContentTypes);
	const expressApp = makeExpressApp({ routers: [restRouter] });

	const httpRequest = request(expressApp)
		.post('/users/2/shares/42/files')
		.set('Content-Type', 'audio/mpeg');

	httpRequest.write(mp3FileBuffer);
	httpRequest.end((err, res) => {
		if (err) throw err;

		expect(res.status).toBe(HTTPStatusCodes.INTERNAL_SERVER_ERROR);
		expect(res.body.error).toEqual(commonRestErrors.internalServerError);

		done();
	});
});