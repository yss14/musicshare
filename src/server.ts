import { Database } from './database/database';
import "reflect-metadata";
import { UserResolver } from './resolvers/user.resolver';
import { GraphQLServer, Options } from 'graphql-yoga';
import { buildSchema, useContainer } from 'type-graphql';
import { ShareResolver } from "./resolvers/share.resolver";
import Container from "typedi";

export class Server {
	private _graphQLServer: GraphQLServer | null;
	private _database: Database;

	constructor(database: Database) {
		this._graphQLServer = null;
		this._database = database;
	}

	public async start(path: string, port: number): Promise<void> {
		// register 3rd party IOC container
		useContainer(Container);

		Container.set({ id: 'DATABASE', factory: () => this._database });

		const schema = await buildSchema({
			resolvers: [
				UserResolver,
				ShareResolver
			]
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