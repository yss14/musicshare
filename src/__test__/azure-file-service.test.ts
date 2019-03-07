import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import { AzureFileService } from '../file-service/AzureFileService';
import * as fs from 'fs';
import { urlIsReachable } from './utils/url-is-reachable';
import moment = require('moment');
import { v4 as uuid } from 'uuid';
import { promises as fsPromises } from 'fs';
import * as azBlob from 'azure-storage';

const startAzurite = () => {
	return new Promise<ChildProcess>((resolve, reject) => {
		const childProcess = spawn('azurite-blob', ['-l', 'azurite_test']);

		childProcess.stderr!.on('data', (data) => reject(data));

		resolve(childProcess);
	});
}

let azuriteProcess: ChildProcess | null = null;

beforeAll(async () => {
	if (!process.env.IS_CI) {
		azuriteProcess = await startAzurite();
	}
});

afterAll(async () => {
	if (azuriteProcess) {
		azuriteProcess.kill();

		await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
	}
})

describe('instance creation', () => {
	test('single instance', async () => {
		const container = 'single-instance';
		await AzureFileService.makeService(container);
	});

	test('two instances same container', async () => {
		const container = 'two-instances-same-container';
		await AzureFileService.makeService(container);
		await AzureFileService.makeService(container);
	});

	test('invalid container name', async () => {
		const container = 'invalid_container%-name';

		await expect(AzureFileService.makeService(container)).rejects.toThrow(SyntaxError);
	});

	test('container creation throws error', async () => {
		const blobService = azBlob.createBlobService();
		blobService.createContainerIfNotExists = <any>jest.fn(
			(container: string, callback: (err: Error) => void) => {
				callback(new Error('Cannot create container'));
			}
		);

		await expect(AzureFileService.makeService('somecontainer', blobService))
			.rejects.toThrowError('Cannot create container');
	});
});

describe('file upload', () => {
	const mp3FilePath = path.join(__dirname, 'assets', 'SampleAudio.mp3');
	const container = 'testupload';

	test('upload mp3 file', async () => {
		const azureFileService = await AzureFileService.makeService(container);

		await azureFileService.uploadFile({
			filenameRemote: 'SampleAudio.mp3',
			contentType: 'audio/mp3',
			source: fs.createReadStream(mp3FilePath)
		});
	});

	test('upload already existing file', async () => {
		const azureFileService = await AzureFileService.makeService(container);

		await azureFileService.uploadFile({
			filenameRemote: 'AlreadyExisting.mp3',
			contentType: 'audio/mp3',
			source: fs.createReadStream(mp3FilePath)
		});

		await azureFileService.uploadFile({
			filenameRemote: 'AlreadyExisting.mp3',
			contentType: 'audio/mp3',
			source: fs.createReadStream(mp3FilePath)
		});
	});

	test('blob api throws error for write stream creation', async () => {
		const blobService = azBlob.createBlobService();
		blobService.createWriteStreamToBlockBlob = <any>jest.fn(
			// tslint:disable:max-func-args
			(container: string, blob: string, opts: any, callback: (err: Error) => void) => {
				callback(new Error('Cannot create write stream to block blob'));
			}
		);
		const azureFileService = await AzureFileService.makeService(container, blobService);

		await expect(azureFileService.uploadFile({
			filenameRemote: 'AlreadyExisting.mp3',
			contentType: 'audio/mp3',
			source: fs.createReadStream(mp3FilePath)
		})).rejects.toThrowError('Cannot create write stream to block blob');
	});
});

// These test cases only work with real-world azure blob at the moment
// https://github.com/Azure/Azurite/issues/151
if (process.env.IS_CI) {
	describe('get url to file', () => {
		const mp3FilePath = path.join(__dirname, 'assets', 'SampleAudio.mp3');
		const container = 'testupload';

		test('get url to uploaded file', async () => {
			const azureFileService = await AzureFileService.makeService(container);
			const filenameRemote = 'SomeFile.mp3';

			await azureFileService.uploadFile({
				filenameRemote: filenameRemote,
				contentType: 'audio/mp3',
				source: fs.createReadStream(mp3FilePath)
			});

			const urlToFile = await azureFileService.getLinkToFile({ filenameRemote, expireDate: moment().add(20, 'seconds') });

			const urlToFileIsReachable = await urlIsReachable(urlToFile);

			expect(urlToFileIsReachable).toBeTruthy();
		});

		test('get url to uploaded file expired', async () => {
			const azureFileService = await AzureFileService.makeService(container);
			const filenameRemote = 'SomeFile.mp3';

			await azureFileService.uploadFile({
				filenameRemote: filenameRemote,
				contentType: 'audio/mp3',
				source: fs.createReadStream(mp3FilePath)
			});

			const urlToFile = await azureFileService.getLinkToFile({ filenameRemote, expireDate: moment().add(-20, 'seconds') });

			const urlToFileIsReachable = await urlIsReachable(urlToFile);

			expect(urlToFileIsReachable).toBeFalsy();
		});

		test('get url to uploaded file no end date specified', async () => {
			const azureFileService = await AzureFileService.makeService(container);
			const filenameRemote = 'SomeFile.mp3';

			await azureFileService.uploadFile({
				filenameRemote: filenameRemote,
				contentType: 'audio/mp3',
				source: fs.createReadStream(mp3FilePath)
			});

			const urlToFile = await azureFileService.getLinkToFile({ filenameRemote });

			await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

			const urlToFileIsReachable = await urlIsReachable(urlToFile);

			expect(urlToFileIsReachable).toBeFalsy();
		});
	});
}

describe('get file as buffer', () => {
	const mp3FilePath = path.join(__dirname, 'assets', 'SampleAudio.mp3');
	const container = 'testupload';

	test('get existing file as buffer', async () => {
		const azureFileService = await AzureFileService.makeService(container);

		const filenameRemote = 'file-' + uuid().split('-').join('') + '.mp3';

		await azureFileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: 'audio/mp3',
			source: fs.createReadStream(mp3FilePath)
		});

		const readBuffer = await fsPromises.readFile(mp3FilePath);
		const receivedBuffer = await azureFileService.getFileAsBuffer(filenameRemote);

		expect(receivedBuffer.equals(readBuffer)).toBe(true);
	});

	test('get not-existing file as buffer', async () => {
		const azureFileService = await AzureFileService.makeService(container);

		await expect(azureFileService.getFileAsBuffer('some-not-existing-file.mp3')).rejects.toThrow();
	});
});