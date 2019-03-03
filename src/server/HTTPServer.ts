import { GraphQLServer, Options } from 'graphql-yoga';
import * as express from 'express';
import * as path from 'path';
import * as Cors from 'cors';
import * as Morgan from 'morgan';
import { fileUploadRouter } from './routes/file-upload-route';
import { __DEV__, __PROD__ } from '../utils/env/env-constants';
import { FileService } from '../file-service/FileService';
import { SongUploadProcessingQueue } from '../job-queues/SongUploadProcessingQueue';
import { Server } from 'net';

const ONE_HUNDRED_MEGABYTE = 100 * 1024 * 1024;

export class HTTPServer {
	private expressApp!: express.Application;
	private httpServer!: Server;

	private constructor(
		private readonly graphQLServer: GraphQLServer,
		private readonly fileService: FileService,
		private readonly uploadProcessingQueue: SongUploadProcessingQueue
	) {
		this.expressApp = graphQLServer.express;
	}

	public static async makeServer(graphQLServer: GraphQLServer, fileService: FileService, uploadProcessingQueue: SongUploadProcessingQueue) {
		const httpServer = new HTTPServer(graphQLServer, fileService, uploadProcessingQueue);

		httpServer.makeExpressSetup();

		return httpServer;
	}

	private makeExpressSetup() {
		this.expressApp.use(Cors());
		this.expressApp.disable('x-powered-by');
		this.expressApp.use(Morgan('dev'));
	}

	private async makeRestRoutes() {
		const fileUploadRoutes = fileUploadRouter({
			fileService: this.fileService,
			uploadProcessingQueue: this.uploadProcessingQueue,
			maxFileSize: ONE_HUNDRED_MEGABYTE
		});
		this.expressApp.use(fileUploadRoutes);

		/* istanbul ignore next */
		if (!__PROD__) {
			this.expressApp.get('/static/debug/*', (req: express.Request, res: express.Response) => {
				res.sendFile(path.join(__dirname, '../../src/', req.path));
			})
		}
	}

	public async start(path: string, port: number): Promise<void> {
		const serverOptions: Options = {
			port,
			endpoint: path,
			playground: !__PROD__ ? '/playground' : undefined,
		};

		this.httpServer = await this.graphQLServer.start(serverOptions);
		await this.makeRestRoutes();
	}

	public stop(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.httpServer.close(() => resolve());
		});
	}
}