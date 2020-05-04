import { setupTestSuite, SetupTestEnvArgs, setupTestEnv, makeAllScopes } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { executeGraphQLQuery, insufficientPermissionsError } from "./utils/graphql"
import { Permissions } from "@musicshare/shared-types"

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

const makeMutation = (mutation: string) => `mutation{${mutation}}`

describe("generate uploadable url", () => {
	const makeGenerateUploadableUrlMutation = () => `
		generateUploadableUrl
	`
	const query = makeMutation(makeGenerateUploadableUrlMutation())

	test("succeeds", async () => {
		const { graphQLServer } = await setupTest({})

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.generateUploadableUrl).toBeString()
	})

	test("insufficient permissions fails", async () => {
		const { graphQLServer } = await setupTest({})

		const scopes = makeAllScopes()
		scopes[0].permissions = scopes[0].permissions.filter((permission) => permission !== Permissions.SONG_UPLOAD)

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes })

		expect(body).toMatchObject(insufficientPermissionsError())
	})
})
