import { BlobService } from './file-uploader';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { UserResolver } from '../resolvers/user.resolver';
import { GraphQLServer, Options } from 'graphql-yoga';
import { buildSchema, useContainer } from 'type-graphql';
import { ShareResolver } from "../resolvers/share.resolver";
import * as express from 'express';
import * as path from 'path';
import { NodeEnv } from '../types/common-types';
import { SongResolver } from '../resolvers/song.resolver';
import * as Cors from 'cors';
import * as Morgan from 'morgan';

export class Server {
	private _graphQLServer: GraphQLServer | null;

	constructor(
		private readonly database: DatabaseConnection,
		private readonly fileUpload: BlobService
	) {
		this._graphQLServer = null;
	}

	public async start(endpoint: string, port: number): Promise<void> {
		const schema = await buildSchema({
			resolvers: [
				UserResolver,
				ShareResolver,
				SongResolver
			]
		});

		this._graphQLServer = new GraphQLServer({ schema });

		this._graphQLServer.express.use(Cors());
		this._graphQLServer.express.disable('x-powered-by');
		this._graphQLServer.express.use(Morgan('dev'));

		this._graphQLServer.express.use(
			'/users/:userID/shares/:shareID/files',
			(req: express.Request, res: express.Response, next: express.NextFunction) => {
				(req as any).saveParams = req.params;

				next();
			},
			express.Router()
				.post(
					'*',
					this.fileUpload.getRawBodyParser(50 * 1024 * 1024),
					this.fileUpload.getUploadRoute()
				)
		);

		if (process.env.NODE_ENV === NodeEnv.Development) {
			this._graphQLServer.express.get('/static/debug/*', (req: express.Request, res: express.Response) => {
				res.sendFile(path.join(__dirname, '../../src/', req.path));
			})
		}

		const serverOptions: Options = {
			port,
			endpoint: endpoint,
			playground: '/playground',
		};

		await this._graphQLServer.start(serverOptions);
	}
}