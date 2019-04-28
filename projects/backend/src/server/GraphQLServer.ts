import { buildSchema, ContainerType, AuthChecker } from 'type-graphql';
import { ApolloServer } from "apollo-server-express";
import { ContextRequest } from '../types/context';

export const makeGraphQLServer = async <C = unknown>(container: ContainerType, authChecker: AuthChecker<C>, ...resolvers: Function[]) => {
	const schema = await buildSchema({
		resolvers,
		container,
		authChecker,
	});

	const graphQLServer = new ApolloServer({
		schema,
		context: ({ req }: { req: ContextRequest }) => {
			return req.context;
		}
	});

	return graphQLServer;
}