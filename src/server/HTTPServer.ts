import { GraphQLServer, Options } from 'graphql-yoga';
import * as express from 'express';
import * as path from 'path';
import * as Cors from 'cors';
import * as Morgan from 'morgan';
import { fileUploadRouter } from './routes/file-upload-route';
import { __DEV__ } from '../utils/env/env-constants';
import { FileService } from '../file-service/FileService';
import { SongUploadProcessingQueue } from '../job-queues/SongUploadProcessingQueue';

const ONE_HUNDRED_MEGABYTE = 100 * 1024 * 1024;

export class HTTPServer {
	private _expressApp!: express.Application;

	private constructor(
		private readonly graphQLServer: GraphQLServer,
		private readonly fileService: FileService,
		private readonly uploadProcessingQueue: SongUploadProcessingQueue
	) {
		this._expressApp = graphQLServer.express;
	}

	public static async makeServer(graphQLServer: GraphQLServer, fileService: FileService, uploadProcessingQueue: SongUploadProcessingQueue) {
		const httpServer = new HTTPServer(graphQLServer, fileService, uploadProcessingQueue);

		httpServer.makeExpressSetup();

		return httpServer;
	}

	private makeExpressSetup() {
		this._expressApp.use(Cors());
		this._expressApp.disable('x-powered-by');
		this._expressApp.use(Morgan('dev'));
	}

	private async makeRestRoutes() {
		const fileUploadRoutes = fileUploadRouter({
			fileService: this.fileService,
			uploadProcessingQueue: this.uploadProcessingQueue,
			maxFileSize: ONE_HUNDRED_MEGABYTE
		});
		this._expressApp.use(fileUploadRoutes);

		if (__DEV__) {
			this._expressApp.get('/static/debug/*', (req: express.Request, res: express.Response) => {
				res.sendFile(path.join(__dirname, '../../src/', req.path));
			})
		}
	}

	public async start(path: string, port: number): Promise<void> {
		const serverOptions: Options = {
			port,
			endpoint: path,
			playground: __DEV__ ? '/playground' : undefined,
		};

		await this.graphQLServer.start(serverOptions);
		await this.makeRestRoutes();
	}
}