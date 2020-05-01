import { setupTestEnv, setupTestSuite, SetupTestEnvArgs } from "./utils/setup-test-env"
import { testData } from "../database/seed"
import { executeGraphQLQuery, makeGraphQLResponse } from "./utils/graphql"
import { Share } from "../models/ShareModel"
import { includesSong, compareSongs } from "./utils/compare-songs"
import { v4 as uuid } from "uuid"
import { songKeys, songKeysFileSources, songKeysFileSourceUpload } from "./fixtures/song-query"
import moment from "moment"
import { makeMockedDatabase } from "./mocks/mock-database"
import { Permissions, UserStatus } from "@musicshare/shared-types"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import { Song } from "../models/SongModel"
import { ShareNotFoundError } from "../services/ShareService"
import { sortBy } from "lodash"
import { isFileUpload } from "../models/FileSourceModels"

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

const makeShareQuery = (id: string, additionalQueries: string[] = []) => {
	return `
		query{
			share(shareID: "${id}"){
				id,
				name,
				isLibrary,
				${additionalQueries.join(",\n")}
			}
		}
	`
}

const makeShareSongsQuery = (range?: [number, number]) => {
	return `
		songs${range ? `(from: ${range[0]} take: ${range[1]})` : ""}{
			${songKeys}
		}
	`
}

const makeShareSongsDirtyQuery = (lastTimestamp: Date) => {
	return `
		songsDirty(lastTimestamp: "${lastTimestamp.toISOString()}"){
			nodes{
				${songKeys}
			}
		}
	`
}

const makeShareSongQuery = (id: string, props: string[] = []) => {
	return `
		song(id: "${id}"){
			${songKeys},
			${props.join(",")}
		}
	`
}

const makeSharePlaylistsQuery = () => `
	playlists{
		id,
		name,
		shareID,
		dateAdded,
	}
`

const makeSharePlaylistQuery = (playlistID: string, fields: string[] = []) => `
	playlist(playlistID: "${playlistID}"){
		id,
		name,
		shareID,
		dateAdded,
		${fields.join(",\n")}
	}
`

describe("get share by id", () => {
	test("get share by id", async () => {
		const { graphQLServer } = await setupTest({})

		const share = testData.shares.library_user1
		const query = makeShareQuery(share.share_id.toString())

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toEqual(makeGraphQLResponse({ share: Share.fromDBResult(share) }))
	})

	test("get share by id not existing", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = uuid()
		const query = makeShareQuery(shareID.toString())

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Share with id ${shareID} not found` }]))
	})

	test("get share by id not part of", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user2.share_id.toString()
		const query = makeShareQuery(shareID.toString())

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Share with id ${shareID} not found` }]))
	})
})

describe("get share songs", () => {
	const shareID = testData.shares.library_user1.share_id

	test("get all songs of library", async () => {
		const { graphQLServer } = await setupTest({})

		const library = testData.shares.library_user1
		const query = makeShareQuery(library.share_id.toString(), [makeShareSongsQuery()])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })
		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
		].map((result) => Song.fromDBResult(result, shareID))

		expectedSongs.forEach((expectedSong) => includesSong(body.data.share.songs, expectedSong))
	})

	test("get all songs of library with range query", async () => {
		const { graphQLServer } = await setupTest({})

		const library = testData.shares.library_user1
		const query = makeShareQuery(library.share_id.toString(), [makeShareSongsQuery([1, 2])])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		const expectedSongs = [testData.songs.song1_library_user1, testData.songs.song2_library_user1].map((result) =>
			Song.fromDBResult(result, shareID),
		)

		expectedSongs.forEach((expectedSong) => includesSong(body.data.share.songs, expectedSong))
	})

	test("get all dirty songs", async () => {
		const { graphQLServer } = await setupTest({})

		const library = testData.shares.library_user1
		const lastTimestamp = moment().subtract(150, "minutes").toDate()
		const query = makeShareQuery(library.share_id.toString(), [makeShareSongsDirtyQuery(lastTimestamp)])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		const expectedSongs = [testData.songs.song2_library_user1, testData.songs.song3_library_user1].map((result) =>
			Song.fromDBResult(result, shareID),
		)

		const receivedSongs = body.data.share.songsDirty.nodes
		expect(receivedSongs.length).toBe(2)
		expectedSongs.forEach((expectedSong) => includesSong(receivedSongs, expectedSong))
	})

	test("get all songs of a share", async () => {
		const { graphQLServer } = await setupTest({})

		const share = testData.shares.some_share
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongsQuery()])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })
		const expectedShareIDs = [
			testData.shares.library_user1.share_id,
			testData.shares.library_user1.share_id,
			testData.shares.library_user1.share_id,
			testData.shares.library_user2.share_id,
		]
		const expectedSongs = [
			testData.songs.song1_library_user1,
			testData.songs.song2_library_user1,
			testData.songs.song3_library_user1,
			testData.songs.song4_library_user2,
		].map((result, idx) => Song.fromDBResult(result, expectedShareIDs[idx]))

		expectedSongs.forEach((expectedSong) => includesSong(body.data.share.songs, expectedSong))
	})
})

describe("get share song", () => {
	test("get library song by id", async () => {
		const { graphQLServer } = await setupTest({})

		const share = testData.shares.library_user1
		const song = testData.songs.song2_library_user1
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongQuery(song.song_id.toString())])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		compareSongs(Song.fromDBResult(song, share.share_id), body.data.share.song)
	})

	test("get library song by id not existing", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id.toString()
		const songID = uuid()
		const query = makeShareQuery(shareID, [makeShareSongQuery(songID.toString())])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.share.song).toBe(null)
		expect(body.errors).toMatchObject([{ message: `Song with id ${songID} not found in share ${shareID}` }])
	})

	test("get library song by id with access url", async () => {
		const { graphQLServer } = await setupTest({})

		const share = testData.shares.library_user1
		const song = testData.songs.song2_library_user1
		const query = makeShareQuery(share.share_id.toString(), [
			makeShareSongQuery(song.song_id.toString(), [songKeysFileSources([songKeysFileSourceUpload("accessUrl")])]),
		])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.share.song).toBeDefined()
		expect(body.data.share.song.sources).toBeArrayOfSize(1)
		expect(body.data.share.song.sources[0].accessUrl).toBeString()
	})

	test("get share song succeeds", async () => {
		const { graphQLServer } = await setupTest({})

		const share = testData.shares.some_share
		const song = testData.songs.song4_library_user2
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongQuery(song.song_id.toString())])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.share.song).not.toBeNull()
		compareSongs(body.data.share.song, Song.fromDBResult(song, testData.shares.library_user2.share_id))
	})

	test("get share song from unrelated share fails", async () => {
		const { graphQLServer } = await setupTest({})

		const share = testData.shares.some_unrelated_library
		const song = testData.songs.song5_library_user3
		const query = makeShareQuery(share.share_id.toString(), [makeShareSongQuery(song.song_id.toString())])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.errors).toMatchObject([{ message: `Share with id ${share.share_id} not found` }])
	})
})

describe("get share related data", () => {
	const makeSharePermissionsQuery = () => `permissions`

	test("get share permissions", async () => {
		const database = makeMockedDatabase()
		;(<jest.Mock>database.query).mockReturnValue([testData.shares.library_user1])
		const { graphQLServer } = await setupTest({ database })
		const shareID = testData.shares.library_user1.share_id.toString()
		const query = makeShareQuery(shareID, [makeSharePermissionsQuery()])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.share.permissions).toEqual(Permissions.ALL)
	})
})

describe("get share playlists", () => {
	test("all playlists", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id.toString()
		const query = makeShareQuery(shareID, [makeSharePlaylistsQuery()])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		const expectedPlaylists = [
			testData.playlists.playlist1_library_user1,
			testData.playlists.playlist2_library_user1,
		].map((playlist) => ({
			id: playlist.playlist_id,
			name: playlist.name,
		}))

		expect(body.data.share.playlists).toMatchObject(expectedPlaylists)
	})

	test("get by id", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id.toString()
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString()
		const query = makeShareQuery(shareID, [makeSharePlaylistQuery(playlistID)])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		const expectedPlaylist = testData.playlists.playlist1_library_user1
		expect(body.data.share.playlist).toMatchObject({
			id: expectedPlaylist.playlist_id,
			name: expectedPlaylist.name,
		})
	})

	test("get playlist songs", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id.toString()
		const playlistID = testData.playlists.playlist1_library_user1.playlist_id.toString()
		const query = makeShareQuery(shareID, [makeSharePlaylistQuery(playlistID, [`songs{${songKeys}}`])])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })
		const receivedSongs = body.data.share.playlist.songs
		const expectedSongs = testData.playlists.playlist1_library_user1.songs.map((song) =>
			Song.fromDBResult(
				{
					...song,
					date_added: new Date(),
					date_removed: null,
				},
				shareID,
			),
		)

		expect(receivedSongs).toBeArrayOfSize(testData.playlists.playlist1_library_user1.songs.length)
		expectedSongs.forEach((expectedSong) => includesSong(receivedSongs, expectedSong))
	})
})

describe("get share users", () => {
	const shareID = testData.shares.some_share.share_id

	test("accepted, pending, deleted users", async () => {
		const { graphQLServer, userService } = await setupTest({})

		const inviterID = testData.users.user2.user_id
		const { createdUser: createdUserPending } = await userService.inviteToShare(
			shareID,
			inviterID,
			"user1@gmail.com",
		)
		const { createdUser: createdUserRevoked } = await userService.inviteToShare(
			shareID,
			inviterID,
			"user2@gmail.com",
		)
		await userService.revokeInvitation(createdUserRevoked.id)

		const query = makeShareQuery(shareID, ["users{id, status}"])
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(sortBy(body.data.share.users, "id")).toEqual(
			sortBy(
				[
					{ id: testData.users.user1.user_id, status: UserStatus.Accepted },
					{ id: testData.users.user2.user_id, status: UserStatus.Accepted },
					{ id: createdUserPending.id, status: UserStatus.Pending },
				],
				"id",
			),
		)
	})
})

describe("get user permissions", () => {
	const makeGetUserPermissionsQuery = () => `userPermissions`

	test("get user permissions", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id.toString()
		const query = makeShareQuery(shareID, [makeGetUserPermissionsQuery()])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.share.userPermissions).toBeArrayOfSize(Permissions.ALL.length)
		expect(body.data.share.userPermissions).toContainAllValues(Permissions.ALL)
	})
})

describe("create share", () => {
	const makeCreateShareMutation = (name: string) => `
		mutation{
			createShare(name: "${name}"){
				id,
				name,
				permissions
			}
		}
	`

	test("valid share", async () => {
		const { graphQLServer, songService } = await setupTest({})

		const newShareName = "New Share"
		const query = makeCreateShareMutation(newShareName)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.createShare.permissions).toBeArrayOfSize(Permissions.ALL.length)
		expect(body.data.createShare.name).toEqual(newShareName)

		// check user library songs are referenced in newly created share
		const userLibrarySongs = await songService.getByShare(testData.shares.library_user1.share_id)
		const newlyCreatedShareSongs = await songService.getByShare(body.data.createShare.id)

		const userLibrarySongIDs = userLibrarySongs.map((song) => song.id)
		const newlyCreatedShareSongIDs = newlyCreatedShareSongs.map((song) => song.id)

		expect(newlyCreatedShareSongIDs.sort()).toEqual(userLibrarySongIDs.sort())
	})

	test("invalid share name", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeCreateShareMutation("")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data).toBe(null)
		expect(body.errors).toMatchObject([{ message: "Argument Validation Error" }])
	})
})

describe("rename share", () => {
	const makeRenameShareMutation = (shareID: string, name: string) => `
		mutation{
			renameShare(shareID: "${shareID}" name: "${name}"){
				id
				name
			}
		}
	`
	const shareID = testData.shares.library_user1.share_id

	test("valid name", async () => {
		const { graphQLServer } = await setupTest({})

		const newShareName = "New Share"
		const query = makeRenameShareMutation(shareID, newShareName)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.renameShare).toEqual({
			id: shareID,
			name: newShareName,
		})
	})

	test("invalid name", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeRenameShareMutation(shareID, "")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data).toBeNull()
		expect(body.errors).toMatchObject([{ message: "Argument Validation Error" }])
	})

	test("forbidden share", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user2.share_id
		const query = makeRenameShareMutation(shareID, "New Share")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data).toBeNull()
		expect(body.errors).toMatchObject([{ message: `Share with id ${shareID} not found` }])
	})
})

describe("delete share", () => {
	const makeDeleteShareMutation = (shareID: string) => `
		mutation{
			deleteShare(shareID: "${shareID}")
		}
	`
	const shareID = testData.shares.library_user1.share_id

	test("existing share", async () => {
		const { graphQLServer, shareService } = await setupTest({})

		const userID = testData.users.user1.user_id
		const query = makeDeleteShareMutation(shareID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.deleteShare).toBeTrue()

		await expect(shareService.getShareByID(shareID, userID)).rejects.toThrowError(ShareNotFoundError)

		const userShares = await shareService.getSharesOfUser(userID)
		expect(userShares.map((share) => share.id)).not.toContain(shareID)
	})

	test("forbidden share", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user2.share_id
		const query = makeDeleteShareMutation(shareID)
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data).toBeNull()
		expect(body.errors).toMatchObject([{ message: `Share with id ${shareID} not found` }])
	})
})

describe("invite to share", () => {
	const makeInviteToShareMutation = (shareID: string, email: string) => `
		mutation{
			inviteToShare(input: {shareID: "${shareID}", email: "${email}"})
		}
	`
	const shareID = testData.shares.some_share.share_id

	test("not existing email succeeds", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeInviteToShareMutation(shareID, "test@gmail.com")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.inviteToShare).toBeString()
	})

	test("email of already user not member succeeds", async () => {
		const { graphQLServer, services } = await setupTest({})

		const email = testData.users.user3.email
		const query = makeInviteToShareMutation(shareID, email)
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({
				inviteToShare: null,
			}),
		)

		const userShares = await services.shareService.getSharesOfUser(testData.users.user3.user_id)
		expect(userShares.map((share) => share.id)).toContain(shareID)
	})

	test("email of already existing member fails", async () => {
		const { graphQLServer } = await setupTest({})

		const email = testData.users.user1.email
		const query = makeInviteToShareMutation(shareID, email)
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(
				{
					inviteToShare: null,
				},
				[
					{
						message: `User already member of share`,
					},
				],
			),
		)
	})

	test("invalid email fails", async () => {
		const { graphQLServer } = await setupTest({})

		const query = makeInviteToShareMutation(shareID, "test%gmail.com")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ inviteToShare: null }, [{ message: "Argument Validation Error" }]),
		)
	})

	test("library is rejected", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.library_user1.share_id
		const query = makeInviteToShareMutation(shareID, "test@gmail.com")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(
				{
					inviteToShare: null,
				},
				[
					{
						message: "Invitations to user libraries is not possible",
					},
				],
			),
		)
	})

	test("forbidden share is rejected", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.some_unrelated_library.share_id
		const query = makeInviteToShareMutation(shareID, "test@gmail.com")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(
				{
					inviteToShare: null,
				},
				[
					{
						message: `Share with id ${shareID} not found`,
					},
				],
			),
		)
	})
})

describe("accept invitation", () => {
	const makeAcceptInvitationMutation = (invitationToken: string, name: string, password: string) => `
		mutation{
			acceptInvitation(input: {invitationToken: "${invitationToken}", name: "${name}", password: "${password}"}){
				user{
					id
					name
					email
				}
				restoreToken
			}
		}
	`
	const shareID = testData.shares.some_share.share_id
	const inviterID = testData.users.user1.user_id
	const email = "inviteme@gmail.com"

	test("valid token succeeds", async () => {
		const { graphQLServer, userService, passwordLoginService } = await setupTest({})

		const { invitationLink } = await userService.inviteToShare(shareID, inviterID, email)
		const invitationToken = invitationLink.split("/")[invitationLink.split("/").length - 1]

		const query = makeAcceptInvitationMutation(invitationToken, "1337 User", "password")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.acceptInvitation).toMatchObject({
			user: {
				id: expect.toBeString(),
				name: "1337 User",
				email,
			},
			restoreToken: expect.toBeString(),
		})

		const refreshToken = await passwordLoginService.login(email, "password")

		expect(refreshToken).toBeString()
	})

	test("invalid token fails", async () => {
		const { graphQLServer } = await setupTest({})

		const invitationToken = "jnklcjnaaksnnnasjnnnjkasd=="

		const query = makeAcceptInvitationMutation(invitationToken, "1337 User", "password")
		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(null, [
				{
					message: "invitationToken is invalid",
				},
			]),
		)
	})
})

describe("revoke invitation", () => {
	const makeRevokeInvitationMutation = (shareID: string, userID: string) => `
		mutation{
			revokeInvitation(input: {shareID: "${shareID}", userID: "${userID}"})
		}
	`
	const shareID = testData.shares.some_share.share_id
	const inviterID = testData.users.user1.user_id

	test("invited user not yet accepted succeeds", async () => {
		const { graphQLServer, userService } = await setupTest({})

		const { createdUser } = await userService.inviteToShare(shareID, inviterID, "some@gmail.com")
		const query = makeRevokeInvitationMutation(shareID, createdUser.id)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.revokeInvitation).toBeTrue()

		const shareUsers = await userService.getUsersOfShare(shareID)
		expect(shareUsers.map((user) => user.id)).not.toContain(createdUser.id)
	})

	test("invited user has already accepted fails", async () => {
		const { graphQLServer, userService } = await setupTest({})

		const { createdUser, invitationLink } = await userService.inviteToShare(shareID, inviterID, "some@gmail.com")
		const invitationToken = invitationLink.split("/")[invitationLink.split("/").length - 1]
		await userService.acceptInvitation(invitationToken, "Some new name", "password")
		const query = makeRevokeInvitationMutation(shareID, createdUser.id)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: "User has already accepted invitation" }]))
	})

	test("revoke of invation of foreign share fails", async () => {
		const { graphQLServer, userService } = await setupTest({})

		const shareID = testData.shares.some_unrelated_share.share_id
		const inviterID = testData.users.user3.user_id
		const { createdUser } = await userService.inviteToShare(shareID, inviterID, "some@gmail.com")
		const query = makeRevokeInvitationMutation(shareID, createdUser.id)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Share with id ${shareID} not found` }]))
	})
})

describe("leave share", () => {
	const makeLeaveShareMutation = (shareID: string) => `
		mutation{
			leaveShare(input: {shareID: "${shareID}"})
		}
	`

	test("user is member succeeds", async () => {
		const { graphQLServer, userService, playlistService, songService } = await setupTest({})
		const libraryID = testData.shares.library_user1.share_id
		const foreignLibraryID = testData.shares.library_user2.share_id
		const libraryPlaylistID = testData.playlists.playlist1_library_user1.playlist_id
		const sharePlaylistID = testData.playlists.playlist_some_shared_library.playlist_id
		const foreignPlaylistID = testData.playlists.playlist_library_user2.playlist_id
		const foreignSongID = testData.songs.song4_library_user2.song_id
		const librarySongID = testData.songs.song1_library_user1.song_id
		const shareID = testData.shares.some_share.share_id

		// prepare song structure for later testing
		await playlistService.addSongs(libraryID, libraryPlaylistID, [foreignSongID])
		await playlistService.addSongs(shareID, sharePlaylistID, [librarySongID])
		await playlistService.addSongs(foreignLibraryID, foreignPlaylistID, [librarySongID])

		const query = makeLeaveShareMutation(shareID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.leaveShare).toBeTrue()

		const shareUsers = await userService.getUsersOfShare(shareID)
		expect(shareUsers.map((user) => user.id)).not.toContain(testData.users.user1.user_id)

		// check if songs are transfered and removed correctly

		/* check if referenced songs from other user libraties have been deleted from library playlists
		and do not occur in users library songs */
		const librarySongs = await songService.getByShare(libraryID)
		const copiedSongs = librarySongs.filter((song) => song.title === testData.songs.song4_library_user2.title)
		expect(copiedSongs).toEqual([])

		const playlistSongs = (await playlistService.getSongs(libraryPlaylistID)).filter(
			(song) => song.title === testData.songs.song4_library_user2.title,
		)
		expect(playlistSongs).toEqual([])

		// check if songs from this library, which are referenced in other users libraries, are copied correctly to those foreign libraries
		const foreignLibrarySongs = (await songService.getByShare(testData.shares.library_user2.share_id)).filter(
			(song) => song.title === testData.songs.song1_library_user1.title,
		)
		expect(foreignLibrarySongs).toBeArrayOfSize(1)
		expect(foreignLibrarySongs[0].sources.filter(isFileUpload)).toEqual([])

		const foreignPlaylistSongs = await playlistService.getSongs(foreignPlaylistID)
		expect(foreignPlaylistSongs.map((song) => song.id)).toContain(foreignLibrarySongs[0].id)

		// check if user library song has been removed from share playlist
		const sharePlaylistSongs = await playlistService.getSongs(sharePlaylistID)
		expect(sharePlaylistSongs.map((song) => song.id)).not.toContain(testData.songs.song1_library_user1.song_id)
	})

	test("user is not member fails", async () => {
		const { graphQLServer } = await setupTest({})

		const shareID = testData.shares.some_unrelated_share.share_id
		const query = makeLeaveShareMutation(shareID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(makeGraphQLResponse(null, [{ message: `Share with id ${shareID} not found` }]))
	})
})
