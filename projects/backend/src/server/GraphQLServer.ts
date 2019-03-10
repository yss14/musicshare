import { buildSchema, ContainerType } from 'type-graphql';
import { GraphQLServer } from 'graphql-yoga';

export const makeGraphQLServer = async (container: ContainerType, ...resolvers: Function[]) => {
	const schema = await buildSchema({
		resolvers,
		container
	});

	const graphQLServer = new GraphQLServer({ schema });

	return graphQLServer;
}