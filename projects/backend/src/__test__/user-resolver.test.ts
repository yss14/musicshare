import "reflect-metadata"
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql"
import { testData, testPassword } from "../database/seed"
import { Share } from "../models/ShareModel"
import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { v4 as uuid } from "uuid"
import * as argon2 from "argon2"
import { makeMockedDatabase } from "./mocks/mock-database"
import { Viewer } from "../models/UserModel"
import { plainToClass } from "class-transformer"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { Artist } from "../models/ArtistModel"
import { defaultGenres, defaultSongTypes } from "../database/fixtures"
import { songKeys } from "./fixtures/song-query"
import { ShareSong } from "../models/SongModel"
import { buildSongName } from "@musicshare/shared-types"

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

const makeUserQuery = (withShares: boolean = false, libOnly: boolean = true) => {
	return `
		query{
			viewer{
				id
				name
				email
				${
					withShares
						? `shares(libOnly: ${libOnly}){
					id,
					name,
					isLibrary
				}`
						: ""
				}
			}
		}
	`
}

const makeLoginMutation = (email: string, password: string) => `
	mutation{
		login(email: "${email}", password: "${password}"){
			authToken,
			refreshToken
		}
	}
`

describe("get user by id", () => {
	test("get user by id", async () => {
		const { graphQLServer } = await setupTest({})

		const { users } = testData
		const query = makeUserQuery()

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID: users.user1.user_id.toString() })

		expect(body).toEqual(makeGraphQLResponse({ viewer: Viewer.fromDBResult(users.user1) }))
	})

	test("get user by id not existing", async () => {
		const { graphQLServer } = await setupTest({})

		const userID = uuid()
		const query = makeUserQuery()

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID })

		expect(body).toMatchObject(
			makeGraphQLResponse({ viewer: null }, [{ message: `User with id ${userID} not found` }]),
		)
	})
})

describe("get users shares", () => {
	test("get users shares only lib", async () => {
		const { graphQLServer } = await setupTest({})

		const testUser = testData.users.user1
		const query = makeUserQuery(true, true)

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID: testUser.user_id.toString() })

		expect(body).toEqual(
			makeGraphQLResponse({
				viewer: {
					...Viewer.fromDBResult(testUser),
					shares: [testData.shares.library_user1].map(Share.fromDBResult),
				},
			}),
		)
	})

	test("get users shares all", async () => {
		const { graphQLServer } = await setupTest({})

		const testUser = testData.users.user1
		const query = makeUserQuery(true, false)

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID: testUser.user_id.toString() })

		expect(body).toEqual(
			makeGraphQLResponse({
				viewer: {
					...Viewer.fromDBResult(testUser),
					shares: [testData.shares.library_user1, testData.shares.some_share].map(Share.fromDBResult),
				},
			}),
		)
	})
})

describe("login", () => {
	test("successful", async () => {
		const { graphQLServer, authService } = await setupTest({})

		const testUser = testData.users.user1
		const query = makeLoginMutation(testUser.email, testPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })
		const { authToken, refreshToken } = body.data.login

		expect(authToken).toBeString()
		expect(refreshToken).toBeString()
		await expect(authService.verifyToken(authToken)).resolves.toBeObject()
		await expect(authService.verifyToken(refreshToken)).resolves.toBeObject()
	})

	test("wrong password", async () => {
		const { graphQLServer } = await setupTest({})

		const testUser = testData.users.user1
		const query = makeLoginMutation(testUser.email, testPassword + "wrong")

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Credentials invalid` }]))
	})

	test("already hashed password", async () => {
		const { graphQLServer } = await setupTest({})

		const testUser = testData.users.user1
		const query = makeLoginMutation(testUser.email, await argon2.hash(testPassword))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Credentials invalid` }]))
	})

	test("not existing email", async () => {
		const { graphQLServer } = await setupTest({})

		const testUser = testData.users.user1
		const query = makeLoginMutation(testUser.email + "a", testPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Credentials invalid` }]))
	})

	test("unexpected internal error", async () => {
		const database = makeMockedDatabase()
		database.query = () => {
			throw new Error("Unexpected error")
		}
		const { graphQLServer } = await setupTest({ database })

		const testUser = testData.users.user1
		const query = makeLoginMutation(testUser.email, testPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.errors[0].message.indexOf("An internal server error occured")).toBeGreaterThan(-1)
	})
})

describe("change password", () => {
	const makeChangePasswordMutation = (oldPassword: string, newPassword: string) => `
		mutation{
			changePassword(input: {oldPassword: "${oldPassword}", newPassword: "${newPassword}"})
		}
	`
	const newPassword = "ihavean1cenewpass0rd+#$"

	test("valid credentials passed succeeds", async () => {
		const { graphQLServer, passwordLoginService } = await setupTest({})

		const testUser = testData.users.user1
		const query = makeChangePasswordMutation(testPassword, newPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.changePassword).toBeTrue()

		await expect(passwordLoginService.login(testUser.email, newPassword)).resolves.toBeString()
	})

	test("user not found is rejected", async () => {
		const { graphQLServer } = await setupTest({})

		const userID = uuid()
		const query = makeChangePasswordMutation(testPassword, newPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query, userID })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `User with id ${userID} not found` }]))
	})

	test("invalid old password is rejected", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeChangePasswordMutation("some_wrong_old_password", newPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: "Old password is invalid" }]))
	})
})

describe("restore password", () => {
	const makeRestorePasswordMutation = (email: string, restoreToken: string, newPassword: string) => `
		mutation{
			restorePassword(input: {email: "${email}", restoreToken: "${restoreToken}", newPassword: "${newPassword}"})
		}
	`
	const newPassword = "ihavean1cenewpass0rd+#$"

	test("valid credentials passed succeeds", async () => {
		const { graphQLServer, passwordLoginService } = await setupTest({})

		const { email, user_id } = testData.users.user1
		const restoreToken = await passwordLoginService.getRestoreToken(user_id)
		const query = makeRestorePasswordMutation(email, restoreToken, newPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		const newRestoreToken = await passwordLoginService.getRestoreToken(user_id)
		expect(body.data.restorePassword).toBe(newRestoreToken)

		await expect(passwordLoginService.login(email, newPassword)).resolves.toBeString()
	})

	test("invalid restore token is rejected", async () => {
		const { graphQLServer, passwordLoginService } = await setupTest({})

		const { email } = testData.users.user1
		const wrongRestoreToken = passwordLoginService.generatedRestoreToken()
		const query = makeRestorePasswordMutation(email, wrongRestoreToken, newPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: "Restore token invalid" }]))
	})

	test("user with email not existing is rejected", async () => {
		const { graphQLServer, passwordLoginService } = await setupTest({})

		const email = "wrong@gmail.com"
		const { user_id } = testData.users.user1
		const restoreToken = await passwordLoginService.getRestoreToken(user_id)
		const query = makeRestorePasswordMutation(email, restoreToken, newPassword)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Login for email ${email} not found` }]))
	})
})

describe("get restore token", () => {
	test("existing user succeeds", async () => {
		const { passwordLoginService } = await setupTest({})

		await expect(passwordLoginService.getRestoreToken(testData.users.user1.user_id)).resolves.toBeString()
	})

	test("not existing user fails", async () => {
		const { passwordLoginService } = await setupTest({})

		const userID = uuid()

		await expect(passwordLoginService.getRestoreToken(userID)).rejects.toThrowError(
			`Restore token for user ${userID} not found`,
		)
	})
})

describe("issue new auth token", () => {
	const makeIssueAuthTokenQuery = (refreshToken: string) =>
		`mutation{issueAuthToken(refreshToken: "${refreshToken}")}`
	const mockDatabase = makeMockedDatabase()
	;(<jest.Mock>mockDatabase.query).mockReturnValue([])
	const testUser = Viewer.fromDBResult(testData.users.user1)

	test("valid refresh token", async () => {
		const { graphQLServer, authService } = await setupTest({})

		const refreshToken = await authService.issueRefreshToken(testUser)
		const query = makeIssueAuthTokenQuery(refreshToken)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })
		const authToken = body.data.issueAuthToken

		expect(authToken).toBeString()
		await expect(authService.verifyToken(authToken)).resolves.toBeObject()
	})

	test("invalid refresh token", async () => {
		const { graphQLServer } = await setupTest({ database: mockDatabase })
		const refreshToken = "abcd"
		const query = makeIssueAuthTokenQuery(refreshToken)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: "Invalid AuthToken" }]))
	})

	test("expired refresh token", async () => {
		const { graphQLServer, authService } = await setupTest({ database: mockDatabase })
		const refreshToken = await authService.issueRefreshToken(testUser, "-1 day")
		const query = makeIssueAuthTokenQuery(refreshToken)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: "Invalid AuthToken" }]))
	})

	test("user not found", async () => {
		const { graphQLServer, authService } = await setupTest({ database: mockDatabase })
		const testUser = plainToClass(Viewer, { id: uuid() })
		const refreshToken = await authService.issueRefreshToken(testUser)
		const query = makeIssueAuthTokenQuery(refreshToken)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `User with id ${testUser.id} not found` }]))
	})

	test("unexpected internal error", async () => {
		const database = makeMockedDatabase()
		database.query = () => {
			throw new Error("Unexpected error")
		}
		const { graphQLServer, authService } = await setupTest({ database: database })

		const refreshToken = await authService.issueRefreshToken(testUser)
		const query = makeIssueAuthTokenQuery(refreshToken)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.errors[0].message.indexOf("An internal server error occured")).toBeGreaterThan(-1)
	})
})

describe("aggregated user related data", () => {
	const makeShareArtistsQuery = () => `artists{name}`
	const makeShareGenresQuery = () => `genres{name,group}`
	const makeShareSongTypesQuery = () => `songTypes{name,group,hasArtists,alternativeNames}`
	const makeShareTagsQuery = () => "tags"
	const makeUserQuery = (subQuery: string) => {
		return `
			query{
				viewer{
					${subQuery}
				}
			}
		`
	}

	test("get aggregated artists", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeUserQuery(makeShareArtistsQuery())

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.viewer.artists).toIncludeAllMembers(
			["Oliver Smith", "Natalie Holmes", "Kink", "Dusky", "Rue", "Alastor"].map(Artist.fromString),
		)
	})

	test("get aggregated genres", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeUserQuery(makeShareGenresQuery())

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.viewer.genres).toBeArrayOfSize(defaultGenres.length)
	})

	test("get aggregated song types", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeUserQuery(makeShareSongTypesQuery())

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.viewer.songTypes).toBeArrayOfSize(defaultSongTypes.length)
	})

	test("get aggregated tags", async () => {
		const { graphQLServer } = await setupTest({})
		const query = makeUserQuery(makeShareTagsQuery())

		const { body } = await executeGraphQLQuery({ graphQLServer, query })
		const expectedTags = ["Anjuna", "Progressive", "Deep", "Funky", "Dark", "Party Chill"].sort()

		expect(body.data.viewer.tags.sort()).toEqual(expectedTags)
	})
})

describe("find song file duplicates", () => {
	const makeUserQuery = (subQuery: string) => {
		return `
			query{
				viewer{
					${subQuery}
				}
			}
		`
	}
	const makeFindSongFileDuplicatesQuery = (hash: string) => `
		findSongFileDuplicates(hash: "${hash}"){
			${songKeys}
		}
	`

	test("existing hash returns all duplicates", async () => {
		const { graphQLServer } = await setupTest({})
		const song = testData.songs.song1_library_user1
		const hash = song.sources.data[0].hash

		const query = makeUserQuery(makeFindSongFileDuplicatesQuery(hash))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		const expectedDuplicateSongIDs = [song.song_id]

		expect(body.data.viewer.findSongFileDuplicates.map((song: ShareSong) => song.id)).toMatchObject(
			expectedDuplicateSongIDs,
		)
	})

	test("not existing file hash returns empty result", async () => {
		const { graphQLServer } = await setupTest({})
		const hash = "4fded1464736e77865df232cbcb4cd19"

		const query = makeUserQuery(makeFindSongFileDuplicatesQuery(hash))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.viewer.findSongFileDuplicates).toEqual([])
	})

	test("test file hash of foreign library returns empty result", async () => {
		const { graphQLServer } = await setupTest({})
		const song = testData.songs.song5_library_user3
		const hash = song.sources.data[0].hash

		const query = makeUserQuery(makeFindSongFileDuplicatesQuery(hash))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.viewer.findSongFileDuplicates).toEqual([])
	})
})

describe("find near song duplicates", () => {
	const makeUserQuery = (subQuery: string) => {
		return `
			query{
				viewer{
					${subQuery}
				}
			}
		`
	}
	const makeFindNearDuplicateSongsQuery = (title: string, artist: string) => `
		findNearDuplicateSongs(title: "${title}", artist: "${artist}"){
			${songKeys}
		}
	`

	test("returns duplicates", async () => {
		const { graphQLServer } = await setupTest({})
		const song = testData.songs.song1_library_user1
		const title = buildSongName(
			ShareSong.fromDBResult(
				song,
				testData.shares.library_user1.share_id,
				testData.shares.library_user1.share_id,
			) as any,
		)
		const artist = song.artists!.join(", ")

		const query = makeUserQuery(makeFindNearDuplicateSongsQuery(title, artist))

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.viewer.findNearDuplicateSongs.map((song: ShareSong) => song.id)).toContain(song.song_id)
	})
})
