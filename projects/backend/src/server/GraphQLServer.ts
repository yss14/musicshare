import { buildSchema, ContainerType, AuthChecker, NonEmptyArray } from "type-graphql"
import { ApolloServer } from "apollo-server-express"
import { ExpressContext } from "apollo-server-express/dist/ApolloServer"
import { ContextFunction } from "apollo-server-core"
import { IConfig } from "../types/config"
import { SQLErrorInterceptor } from "../middleware/SQLErrorInterceptor"

export const makeGraphQLServer = async <C = unknown>(
	container: ContainerType,
	contextProvider: ContextFunction<ExpressContext, C>,
	config: IConfig,
	authChecker: AuthChecker<C>,
	...resolvers: NonEmptyArray<Function>
) => {
	const schema = await buildSchema({
		resolvers,
		container,
		authChecker,
		globalMiddlewares: [SQLErrorInterceptor],
	})

	const graphQLServer = new ApolloServer({
		schema,
		context: contextProvider,
		playground: config.server.enableGraphQLPlayground,
		introspection: config.server.enableGraphQLPlayground,
		engine: config.server.apolloengine,
	})

	return graphQLServer
}
