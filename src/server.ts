import "reflect-metadata";
import { UserResolver } from './resolvers/user.resolver';
import { GraphQLServer, Options } from 'graphql-yoga';
import { buildSchema } from 'type-graphql';

export class Server {
	private _graphQLServer: GraphQLServer | null;

	constructor() {
		this._graphQLServer = null;
	}

	public async start(path: string, port: number): Promise<void> {
		const schema = await buildSchema({
			resolvers: [UserResolver]
		});

		this._graphQLServer = new GraphQLServer({ schema });

		const serverOptions: Options = {
			port,
			endpoint: path,
			playground: '/playground'
		};

		await this._graphQLServer.start(serverOptions);
	}
}