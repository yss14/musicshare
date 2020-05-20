import { setupTestSuite, SetupTestEnvArgs, setupTestEnv } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { Permission } from "@musicshare/shared-types"
import { testData } from "../database/seed"
import { makeMockedDatabase } from "./mocks/mock-database"
import { executeGraphQLQuery, makeGraphQLResponse, insufficientPermissionsError } from "./utils/graphql"
import { Scopes } from "../types/context"

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

describe("update share member permissions", () => {
	const makeUpdateShareMemberPermissionsMutation = (shareID: string, userID: string, permissions: Permission[]) => `
		mutation{updateShareMemberPermissions(shareID: "${shareID}", userID: "${userID}", permissions: [${permissions
		.map((permission) => `"${permission}"`)
		.join(",")}]){
			id
			permissions
		}
	}
	`
	const shareID = testData.shares.library_user1.share_id.toString()
	const userID = testData.users.user1.user_id.toString()

	const database = makeMockedDatabase()
	;(<jest.Mock>database.query).mockReturnValue([testData.shares.library_user1])

	test("valid permission list", async () => {
		const { graphQLServer } = await setupTest({})

		const permissions: Permission[] = ["playlist:create", "share:owner"]
		const query = makeUpdateShareMemberPermissionsMutation(shareID, userID, permissions)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.updateShareMemberPermissions.permissions.sort()).toEqual(permissions)
	})

	test("invalid permission list", async () => {
		const { graphQLServer } = await setupTest({ database: database })
		const permissions: any[] = ["playlist:createe", "share:owner"]

		const query = makeUpdateShareMemberPermissionsMutation(shareID, userID, permissions)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Argument Validation Error` }]))
	})

	test("insufficient permissions", async () => {
		const { graphQLServer } = await setupTest({ database: database })
		const permissions: Permission[] = ["playlist:create", "share:owner"]
		const query = makeUpdateShareMemberPermissionsMutation(shareID, userID, permissions)
		const scopes: Scopes = [{ shareID, permissions: ["playlist:create", "playlist:modify"] }]

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes })

		expect(body).toMatchObject(insufficientPermissionsError())
	})
})
