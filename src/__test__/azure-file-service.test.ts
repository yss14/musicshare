import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { AzureFileService } from '../file-system/AzureFileService';
import * as fs from 'fs';

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

describe('file upload', () => {
	const mp3FilePath = path.join(__dirname, 'assets', 'SampleAudio.mp3');
	const container = 'testupload';

	test('upload mp3 file', async () => {
		const azureFileService = await AzureFileService.makeService(container);

		await azureFileService.uploadFile({
			filenameRemote: 'SampleAudio.mp3',
			contentType: 'audio/mp3',
			source: fs.createReadStream(mp3FilePath)
		})
	})
});