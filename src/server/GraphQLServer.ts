import { buildSchema } from 'type-graphql';
import { GraphQLServer } from 'graphql-yoga';

export const makeGraphQLServer = async (...resolvers: Function[]) => {
	const schema = await buildSchema({
		resolvers
	});

	const graphQLServer = new GraphQLServer({ schema });

	return graphQLServer;
}