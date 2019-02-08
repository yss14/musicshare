import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { AzureFileService } from '../file-service/AzureFileService';
import * as fs from 'fs';
import { urlIsReachable } from './utils/url-is-reachable';
import moment = require('moment');

const startAzurite = () => {
	return new Promise<ChildProcess>((resolve, reject) => {
		const childProcess = spawn('azurite-blob', ['-l', 'azurite_test']);

		childProcess.stdout.on('data', (data) => {
			if (data.toString().trim().indexOf('Azure Blob Storage Emulator listening on port') > -1) {
				resolve(childProcess);
			}
		});

		childProcess.stderr.on('data', (data) => reject(data));
	});
}

let azuriteProcess: ChildProcess | null = null;

beforeAll(async () => {
	azuriteProcess = await startAzurite();
});

afterAll(() => {
	if (azuriteProcess) {
		azuriteProcess.kill();
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
});

// These test cases only work with real-world azure blob at the moment
// https://github.com/Azure/Azurite/issues/151
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
});