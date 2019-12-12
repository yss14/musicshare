import { configFromEnv, IConfig } from "../types/config";
import { initFileStore, initServices } from "../services/services";
import { makeMockedDatabase } from "./mocks/mock-database";
import { AzureFileService } from "../file-service/AzureFileService";

describe('file storage', () => {
	const config = configFromEnv();

	describe('azure filestorage', () => {
		test('with azure file storage', () => {
			const newConfig: IConfig = { ...config, fileStorage: { ...config.fileStorage, provider: 'azureblob' } };
			const services = initServices(newConfig, makeMockedDatabase());

			expect(services.songFileService).toBeInstanceOf(AzureFileService);
		});

		test('custom container name', () => {
			const customConfig: IConfig = {
				...config,
				fileStorage: {
					...config.fileStorage,
					provider: 'azureblob',
					azureStorage: {
						container: 'my-custom-container'
					},
				},
			}
			const fileService = initFileStore(customConfig)

			expect(fileService.container).toBe('my-custom-container')
		})
	})

	describe('aws s3', () => {
		test('no s3 credentials fails', () => {
			const newConfig: IConfig = { ...config, fileStorage: { ...config.fileStorage, s3: undefined, provider: 'awss3' } };

			expect(() => initServices(newConfig, makeMockedDatabase()))
				.toThrowError('AWS S3 is specified as file storage provider, but no credentials are provided');
		});
	})

	test('unknown file storage providers fails', () => {
		const newConfig: IConfig = { ...config, fileStorage: { ...config.fileStorage, s3: undefined, provider: <any>'some_other' } };

		expect(() => initServices(newConfig, makeMockedDatabase()))
			.toThrowError('Unknown file storage provider some_other');
	});
})