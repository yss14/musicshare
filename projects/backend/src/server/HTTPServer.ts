import * as express from 'express';
import * as pathModule from 'path';
import * as Cors from 'cors';
import * as Morgan from 'morgan';
import { fileUploadRouter } from './routes/file-upload-route';
import { __DEV__, __PROD__ } from '../utils/env/env-constants';
import { IFileService } from '../file-service/FileService';
import { ISongUploadProcessingQueue } from '../job-queues/SongUploadProcessingQueue';
import { Server } from 'net';
import { ApolloServer } from 'apollo-server-express';
import { auth } from '../auth/auth-middleware';
import { CustomRequestHandler } from '../types/context';

const ONE_HUNDRED_MEGABYTE = 100 * 1024 * 1024;

export interface IHTTPServerArgs {
	graphQLServer: ApolloServer;
	songFileService: IFileService;
	uploadProcessingQueue: ISongUploadProcessingQueue;
	authExtractor: CustomRequestHandler;
}

export interface IHTTPServer {
	start(path: string, port: number): Promise<void>;
	stop(): Promise<void>;
}

export const HTTPServer = ({ songFileService, graphQLServer, uploadProcessingQueue, authExtractor }: IHTTPServerArgs): IHTTPServer => {
	let httpServer: Server;
	const expressApp = express();

	expressApp.use(Cors());
	expressApp.disable('x-powered-by');
	expressApp.use(Morgan('dev'));
	expressApp.use(authExtractor as any);

	graphQLServer.applyMiddleware({ app: expressApp });

	const start = async (path: string, port: number) => {
		graphQLServer.setGraphQLPath(path);

		httpServer = await expressApp.listen({ port });

		const fileUploadRoutes = fileUploadRouter({
			songFileService,
			uploadProcessingQueue: uploadProcessingQueue,
			maxFileSize: ONE_HUNDRED_MEGABYTE,
			auth
		});
		expressApp.use(fileUploadRoutes);

		/* istanbul ignore next */
		if (!__PROD__) {
			expressApp.get('/static/debug/*', (req: express.Request, res: express.Response) => {
				res.sendFile(pathModule.join(__dirname, '../../src/', req.path));
			})
		}
	}

	const stop = () => new Promise<void>((resolve) => {
		httpServer.close(() => resolve());
	});

	return { start, stop };
}