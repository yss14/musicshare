import { setupTestSuite, SetupTestEnvArgs, setupTestEnv, CustomResolver } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { Resolver, ObjectType, Field, Query } from "type-graphql"
import { executeGraphQLQuery } from "./utils/graphql"

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

describe("sql error interceptor", () => {
	@ObjectType()
	class TestRouteReturnValue {
		@Field()
		public readonly message!: string
	}

	const testRouteReturnValue: TestRouteReturnValue = { message: "Hello test case!" }

	@Resolver(() => TestRouteReturnValue)
	class ThrowingResolver {
		@Query(() => TestRouteReturnValue)
		public async publicQuery(): Promise<TestRouteReturnValue> {
			await database.query({ sql: "SELECT * FROM blub;" })

			return testRouteReturnValue
		}
	}

	test("intercepts sql error", async () => {
		const customResolvers = (): CustomResolver[] => [[ThrowingResolver, new ThrowingResolver()]]
		const { graphQLServer } = await setupTest({ customResolvers })

		const query = `query{publicQuery{message}}`

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject({
			data: null,
			errors: [{ message: expect.toStartWith("Database error with id") }],
		})
	})
})
