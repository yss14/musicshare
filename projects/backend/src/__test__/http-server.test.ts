import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { HTTPServer } from "../server/HTTPServer"
import { findFreePort } from "./utils/find-free-port"
import { CustomRequestHandler } from "../types/context"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"

const { cleanUp, getDatabase } = setupTestSuite()
let database: IDatabaseClient

const setupTest = async (args: Partial<SetupTestEnvArgs>) => {
	if (!args.database) {
		await clearTables(database)
	}

	const testEnv = await setupTestEnv({ ...args, database: args.database || database })

	return testEnv
}

beforeAll(async () => {
	database = await getDatabase()
})

afterAll(async () => {
	await cleanUp()
})

const mockedAuthExtractor: CustomRequestHandler = (req, res, next) => next()

test("start http server", async () => {
	const { graphQLServer } = await setupTest({ seed: false })

	const httpServer = HTTPServer({
		graphQLServer,
		authExtractor: mockedAuthExtractor,
	})
	const port = await findFreePort()

	await expect(httpServer.start("graphqltest", port)).toResolve()

	await httpServer.stop()
})

test("start http server with graphql playground", async () => {
	const { graphQLServer } = await setupTest({ seed: false })

	const httpServer = HTTPServer({
		graphQLServer,
		authExtractor: mockedAuthExtractor,
	})
	const port = await findFreePort()

	await expect(httpServer.start("graphqltest", port)).toResolve()

	await httpServer.stop()
})
