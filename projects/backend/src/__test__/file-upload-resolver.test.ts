import { setupTestSuite, SetupTestEnvArgs, setupTestEnv, makeAllScopes } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { executeGraphQLQuery, insufficientPermissionsError } from "./utils/graphql"
import { Permissions } from "@musicshare/shared-types"
import validator from "validator"

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
	const makeGenerateUploadableUrlMutation = (fileExtension: string, fileSize: number) => `
		generateUploadableUrl(fileExtension: "${fileExtension}" fileSize: ${fileSize})
	`

	test("valid file extension with dot succeeds", async () => {
		const { graphQLServer } = await setupTest({})
		const fileExtension = ".mp3"

		const query = makeMutation(makeGenerateUploadableUrlMutation(fileExtension, 0))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.generateUploadableUrl).toBeString()
		expect(body.data.generateUploadableUrl).toContain(fileExtension)
		expect(validator.isURL(body.data.generateUploadableUrl)).toBeTrue()
	})

	test("valid file extension without dot succeeds", async () => {
		const { graphQLServer } = await setupTest({})
		const fileExtension = "mp3"

		const query = makeMutation(makeGenerateUploadableUrlMutation(fileExtension, 0))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.generateUploadableUrl).toBeString()
		expect(body.data.generateUploadableUrl).toContain("." + fileExtension)
		expect(validator.isURL(body.data.generateUploadableUrl)).toBeTrue()
	})

	test("empty file extension fails", async () => {
		const { graphQLServer } = await setupTest({})
		const fileExtension = "  "

		const query = makeMutation(makeGenerateUploadableUrlMutation(fileExtension, 0))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject({
			data: null,
			errors: [{ message: "file extension cannot be empty" }],
		})
	})

	test("insufficient permissions fails", async () => {
		const { graphQLServer } = await setupTest({})
		const fileExtension = "mp3"

		const scopes = makeAllScopes()
		scopes[0].permissions = scopes[0].permissions.filter((permission) => permission !== Permissions.SONG_UPLOAD)

		const query = makeMutation(makeGenerateUploadableUrlMutation(fileExtension, 0))

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes })

		expect(body).toMatchObject(insufficientPermissionsError())
	})

	test("quota exceeds fails", async () => {
		const { graphQLServer } = await setupTest({
			configTransformation: (config) => ({ ...config, setup: { ...config.setup, shareQuota: 200 } }),
		})
		const fileExtension = "mp3"
		const fileSize = 500

		const query = makeMutation(makeGenerateUploadableUrlMutation(fileExtension, fileSize))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject({
			data: null,
			errors: [{ message: "Quota of 200 B exceeded" }],
		})
	})
})
