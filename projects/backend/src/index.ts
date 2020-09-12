import "reflect-metadata"
import { HTTPServer } from "./server/HTTPServer"
import Container from "typedi"
import { isValidNodeEnvironment } from "./utils/env/native-envs"
import { loadEnvsFromDotenvFile } from "./utils/env/load-envs-from-file"
import { CustomEnv } from "./utils/env/CustomEnv"
import { tryParseInt } from "./utils/try-parse/try-parse-int"
import { ViewerResolver } from "./resolvers/ViewerResolver"
import { ShareResolver } from "./resolvers/ShareResolver"
import { SongResolver } from "./resolvers/SongResolver"
import { makeGraphQLServer } from "./server/GraphQLServer"
import { __DEV__, __PROD__ } from "./utils/env/env-constants"
import { seedDatabase, insertProductionSetupSeed } from "./database/seed"
import { graphQLAuthChecker, makeAuthExtractor } from "./auth/auth-middleware"
import { IGraphQLContext, makeGraphQLContextProvider } from "./types/context"
import { PlaylistResolver } from "./resolvers/PlaylistResolver"
import { configFromEnv } from "./types/config"
import { connectAndSetupDatabase } from "./database/database"
import { initServices } from "./services/services"
import { FileUploadResolver } from "./resolvers/FileUploadResolver"
import { onShutdown } from "./utils/shutdown"
import { ShareMemberResolver } from "./resolvers/ShareMemberResolver"
import { GenreResolver } from "./resolvers/GenreResolver"

require("source-map-support").install()

const nodeEnv = process.env.NODE_ENV

if (!isValidNodeEnvironment(nodeEnv)) {
	throw new Error(`Invalid node environment ${nodeEnv}`)
}

loadEnvsFromDotenvFile(nodeEnv)
;(async () => {
	const config = configFromEnv()
	const { database, schema } = await connectAndSetupDatabase(config)

	console.info(`Database connected and initialized (v${schema.getVersion()})`)

	const services = initServices(config, database)

	const shareResolver = new ShareResolver(services)
	const songResolver = new SongResolver(services)
	const userResolver = new ViewerResolver(services, config)
	const shareMemberResolver = new ShareMemberResolver(services)
	const playlistResolver = new PlaylistResolver(services)
	const fileUploadResolver = new FileUploadResolver(services, config)
	const genreResolver = new GenreResolver(services)

	Container.set(ShareResolver, shareResolver)
	Container.set(SongResolver, songResolver)
	Container.set(ViewerResolver, userResolver)
	Container.set(PlaylistResolver, playlistResolver)
	Container.set(FileUploadResolver, fileUploadResolver)
	Container.set(ShareMemberResolver, shareMemberResolver)
	Container.set(GenreResolver, genreResolver)

	await services.songFileService.createContainerIfNotExists()
	console.info("FileStorage connected")

	if (config.database.seed === true) {
		await seedDatabase({ database, services })

		console.info("Database seeded with dev/test seed")
	}

	if (__PROD__) {
		const seeded = await insertProductionSetupSeed({ config, services })

		if (seeded) {
			console.info("Database seeded with production seed")
		}
	}

	const graphQLServer = await makeGraphQLServer<IGraphQLContext>(
		Container,
		makeGraphQLContextProvider(services),
		config,
		graphQLAuthChecker,
		ViewerResolver,
		ShareResolver,
		SongResolver,
	)

	const server = HTTPServer({
		graphQLServer,
		authExtractor: makeAuthExtractor(services.authService, services.permissionService, services.shareService),
	})
	const serverPort = tryParseInt(process.env[CustomEnv.REST_PORT], 4000)
	await server.start("/graphql", serverPort)

	console.info(`Server is running on http://localhost:${serverPort}`)
	console.info(`GraphQL endpoint available at http://localhost:${serverPort}/graphql`)
	if (__DEV__) console.info(`GraphQL Playground available at http://localhost:${serverPort}/playground`)

	await onShutdown()

	await server.stop()
})()
	.then()
	.catch(console.error)
