import { setupTestSuite, SetupTestEnvArgs, setupTestEnv } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { executeGraphQLQuery } from "./utils/graphql"
import { genreKeys } from "@musicshare/shared-types"
import { v4 as uuid } from "uuid"
import { testData } from "../database/seed"

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

describe("add genre", () => {
	const makeAddGenreMutation = (name: string, group: string) => `
		addGenre(name: "${name}" group: "${group}"){${genreKeys}}
	`

	test("add genre succeeds", async () => {
		const { graphQLServer } = await setupTest({})

		const name = "Hard Core Techno"
		const group = "Electronic Music"

		const query = makeMutation(makeAddGenreMutation(name, group))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.addGenre).toMatchObject({
			id: expect.toBeString(),
			name,
			group,
		})
	})
})

describe("update genre", () => {
	const makeUpdateGenreMutation = (genreID: string, name: string, group: string) => `
		updateGenre(genreID: "${genreID}" name: "${name}" group: "${group}"){${genreKeys}}
	`

	test("existing genre succeeds", async () => {
		const { graphQLServer, genreService } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id
		const genres = await genreService.getGenresForShare(shareID)
		const genre = genres[0]
		const name = "Hard Core Techno"
		const group = "Electronic Music"

		const query = makeMutation(makeUpdateGenreMutation(genre.id, name, group))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.updateGenre).toMatchObject({
			id: genre.id,
			name,
			group,
		})
	})

	test("not existing genre fails", async () => {
		const { graphQLServer } = await setupTest({})

		const genreID = uuid()
		const name = "Hard Core Techno"
		const group = "Electronic Music"

		const query = makeMutation(makeUpdateGenreMutation(genreID, name, group))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.updateGenre).toBeNull()
		expect(body.errors).toMatchObject([{ message: `Genre with id ${genreID} not found` }])
	})

	test("foreign genre fails", async () => {
		const { graphQLServer, genreService } = await setupTest({})

		const shareID = testData.shares.some_unrelated_library.share_id
		const genres = await genreService.getGenresForShare(shareID)
		const genre = genres[0]
		const name = "Hard Core Techno"
		const group = "Electronic Music"

		const query = makeMutation(makeUpdateGenreMutation(genre.id, name, group))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.updateGenre).toBeNull()
		expect(body.errors).toMatchObject([{ message: `Genre with id ${genre.id} not found` }])
	})
})

describe("remove genre", () => {
	const makeRemoveGenreMutation = (genreID: string) => `
		removeGenre(genreID: "${genreID}")
	`

	test("existing genre succeeds", async () => {
		const { graphQLServer, genreService } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id
		const genres = await genreService.getGenresForShare(shareID)
		const genre = genres[0]

		const query = makeMutation(makeRemoveGenreMutation(genre.id))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.removeGenre).toBeTrue()
	})

	test("not existing genre fails", async () => {
		const { graphQLServer } = await setupTest({})

		const genreID = uuid()
		const query = makeMutation(makeRemoveGenreMutation(genreID))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.removeGenre).toBeNull()
		expect(body.errors).toMatchObject([{ message: `Genre with id ${genreID} not found` }])
	})

	test("foreign genre fails", async () => {
		const { graphQLServer, genreService } = await setupTest({})

		const shareID = testData.shares.some_unrelated_library.share_id
		const genres = await genreService.getGenresForShare(shareID)
		const genre = genres[0]

		const query = makeMutation(makeRemoveGenreMutation(genre.id))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.removeGenre).toBeNull()
		expect(body.errors).toMatchObject([{ message: `Genre with id ${genre.id} not found` }])
	})
})
