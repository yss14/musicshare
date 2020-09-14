import { setupTestSuite, SetupTestEnvArgs, setupTestEnv } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { executeGraphQLQuery } from "./utils/graphql"
import { captchaKeys } from "@musicshare/shared-types"
import { CaptchaTable } from "../database/tables"

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

describe("get captcha", () => {
	const makeGetCaptchaQuery = () => `
		query{captcha{${captchaKeys}}}
	`

	test("get captcha succeeds", async () => {
		const { graphQLServer, database, captchaService } = await setupTest({})

		const query = makeGetCaptchaQuery()

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.captcha).toMatchObject({
			id: expect.toBeString(),
			image: expect.toBeString(),
		})

		const solution = (await database.query(CaptchaTable.selectAll("*")))[0].solution

		await expect(captchaService.checkCaptcha(body.data.captcha.id, solution)).resolves.toBeTrue()
	})
})
