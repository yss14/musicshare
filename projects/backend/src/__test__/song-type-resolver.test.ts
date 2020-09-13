import { setupTestSuite, SetupTestEnvArgs, setupTestEnv } from "./utils/setup-test-env"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { executeGraphQLQuery } from "./utils/graphql"
import { songTypeKeys } from "@musicshare/shared-types"
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

const name = "Super Extended Longcut Mix"
const group = "Electronic Music"
const alternativeNames = ["Super Extended Mix"]

describe("add song type", () => {
	const makeAddSongTypeMutation = (
		name: string,
		group: string,
		alternativeNames?: string[],
		hasArtists: boolean = false,
	) => `
		addSongType(name: "${name}" group: "${group}" ${
		alternativeNames ? `alternativeNames: [${alternativeNames.map((name) => `"${name}"`).join(", ")}]` : ""
	} hasArtists: ${hasArtists}){${songTypeKeys}}
	`

	test("add song type only name and group succeeds", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeMutation(makeAddSongTypeMutation(name, group))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.addSongType).toMatchObject({
			id: expect.toBeString(),
			name,
			group,
			alternativeNames: [],
			hasArtists: false,
		})
	})

	test("add song type with all input arguments succeeds", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeMutation(makeAddSongTypeMutation(name, group, alternativeNames, true))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.addSongType).toMatchObject({
			id: expect.toBeString(),
			name,
			group,
			alternativeNames,
			hasArtists: true,
		})
	})
})

describe("update song type", () => {
	const makeAddSongTypeMutation = (
		songTypeID: string,
		name: string,
		group: string,
		alternativeNames?: string[],
		hasArtists: boolean = false,
	) => `
		updateSongType(songTypeID: "${songTypeID}" name: "${name}" group: "${group}" ${
		alternativeNames ? `alternativeNames: [${alternativeNames.map((name) => `"${name}"`).join(", ")}]` : ""
	} hasArtists: ${hasArtists}){${songTypeKeys}}
	`

	test("existing song type succeeds", async () => {
		const { graphQLServer, songTypeService } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id
		const songTypes = await songTypeService.getSongTypesForShare(shareID)
		const songType = songTypes[0]

		const query = makeMutation(makeAddSongTypeMutation(songType.id, name, group, alternativeNames, true))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.updateSongType).toMatchObject({
			id: songType.id,
			name,
			group,
			alternativeNames,
			hasArtists: true,
		})
	})

	test("not existing song type fails", async () => {
		const { graphQLServer } = await setupTest({})

		const songTypeID = uuid()
		const name = "Hard Core Techno"
		const group = "Electronic Music"

		const query = makeMutation(makeAddSongTypeMutation(songTypeID, name, group))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.updateSongType).toBeNull()
		expect(body.errors).toMatchObject([{ message: `SongType with id ${songTypeID} not found` }])
	})

	test("foreign song type fails", async () => {
		const { graphQLServer, songTypeService } = await setupTest({})

		const shareID = testData.shares.some_unrelated_library.share_id
		const songTypes = await songTypeService.getSongTypesForShare(shareID)
		const songType = songTypes[0]

		const query = makeMutation(makeAddSongTypeMutation(songType.id, name, group))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.updateSongType).toBeNull()
		expect(body.errors).toMatchObject([{ message: `SongType with id ${songType.id} not found` }])
	})
})

describe("remove song type", () => {
	const makeRemoveSongTypeMutation = (songTypeID: string) => `
		removeSongType(songTypeID: "${songTypeID}")
	`

	test("existing song type succeeds", async () => {
		const { graphQLServer, songTypeService } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id
		const songTypes = await songTypeService.getSongTypesForShare(shareID)
		const songType = songTypes[0]

		const query = makeMutation(makeRemoveSongTypeMutation(songType.id))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.removeSongType).toBeTrue()
	})

	test("not existing song type fails", async () => {
		const { graphQLServer } = await setupTest({})

		const songTypeID = uuid()
		const query = makeMutation(makeRemoveSongTypeMutation(songTypeID))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data).toBeNull()
		expect(body.errors).toMatchObject([{ message: `SongType with id ${songTypeID} not found` }])
	})

	test("foreign song type fails", async () => {
		const { graphQLServer, songTypeService } = await setupTest({})

		const shareID = testData.shares.some_unrelated_library.share_id
		const songTypes = await songTypeService.getSongTypesForShare(shareID)
		const songType = songTypes[0]

		const query = makeMutation(makeRemoveSongTypeMutation(songType.id))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data).toBeNull()
		expect(body.errors).toMatchObject([{ message: `SongType with id ${songType.id} not found` }])
	})
})
