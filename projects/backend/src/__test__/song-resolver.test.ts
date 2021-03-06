import { SongUpdateInput } from "../inputs/SongInput"
import { songKeys } from "./fixtures/song-query"
import { setupTestEnv, setupTestSuite, SetupTestEnvArgs, makeAllScopes } from "./utils/setup-test-env"
import { testData } from "../database/seed"
import { executeGraphQLQuery, makeGraphQLResponse, insufficientPermissionsError } from "./utils/graphql"
import { HTTPStatusCodes } from "../types/http-status-codes"
import { makeMockedDatabase } from "./mocks/mock-database"
import { IDatabaseClient } from "postgres-schema-builder"
import { clearTables } from "../database/database"
import moment from "moment"
import { v4 as uuid } from "uuid"
import { ShareSongsTable } from "../database/tables"
import * as path from "path"
import * as fs from "fs"
import { Permissions, shareSongKeys } from "@musicshare/shared-types"

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

const inputToString = (input: SongUpdateInput): string => {
	return (
		"{" +
		Object.entries(input)
			.map((entry) => `${entry[0]}:${JSON.stringify(entry[1])}`)
			.join(",") +
		"}"
	)
}

const makeUpdateSongMutation = (shareID: string, songID: string, input: SongUpdateInput) => `
	mutation{
		updateSong(shareID: "${shareID}", songID: "${songID}", song: ${inputToString(input)}){
			${songKeys}
		}
	}
`

const cleanupHooks: (() => Promise<void>)[] = []

afterAll(async () => {
	await Promise.all(cleanupHooks.map((hook) => hook()))
})

describe("update song mutation", () => {
	const share = testData.shares.library_user1
	const song = testData.songs.song1_library_user1

	const mockDatabase = makeMockedDatabase()
	;(<jest.Mock>mockDatabase.query).mockReturnValue([song])

	test("valid input", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = {
			bpm: 140,
			isRip: false,
			title: "Some new title",
			labels: ["Label A", "Label B"],
			artists: ["Some new artist"],
			tags: ["sometag"],
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)
		const timestampBeforeUpdate = Date.now()

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		const { updateSong } = body.data

		expect(updateSong).toMatchObject(input)
		expect(moment(updateSong.dateLastEdit).valueOf()).toBeGreaterThan(timestampBeforeUpdate)
	})

	test("title null", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			title: null as any,
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [
				{ message: `SongInput attribute title cannot be set null explicitly` },
			]),
		)
	})

	test("title empty", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			title: "",
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [{ message: `Argument Validation Error` }]),
		)
	})

	test("invalid year", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			year: 195,
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [{ message: `Argument Validation Error` }]),
		)
	})

	test("empty artist item", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			artists: ["some valid", ""],
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [{ message: `Argument Validation Error` }]),
		)
	})

	test("null artist", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			artists: null as any,
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [
				{ message: `SongInput attribute artists cannot be set null explicitly` },
			]),
		)
	})

	test("null artist item", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			artists: ["some valid", null],
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		await executeGraphQLQuery({ graphQLServer, query, expectedHTTPCode: HTTPStatusCodes.BAD_REQUEST })
	})

	test("null type", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			type: null as any,
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [
				{ message: `SongInput attribute type cannot be set null explicitly` },
			]),
		)
	})

	test("empty type", async () => {
		const { graphQLServer } = await setupTest({})

		const input: any = <SongUpdateInput>{
			type: "",
		}
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [{ message: `Argument Validation Error` }]),
		)
	})

	test("insufficient permissions", async () => {
		const { graphQLServer } = await setupTest({})
		const input: any = <SongUpdateInput>{
			type: "",
		}
		const shareID = share.share_id.toString()
		const query = makeUpdateSongMutation(share.share_id.toString(), song.song_id.toString(), input)

		const { body } = await executeGraphQLQuery({
			graphQLServer,
			query,
			scopes: [{ shareID, permissions: ["playlist:create", "song:upload"] }],
		})

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [
				{ message: `User has insufficient permissions to perform this action!` },
			]),
		)
	})

	test("foreign song not permitted", async () => {
		const { graphQLServer } = await setupTest({})
		const input: any = {
			bpm: 140,
			isRip: false,
			title: "Some new title",
			labels: ["Label A", "Label B"],
			artists: ["Some new artist"],
			tags: ["sometag"],
		}
		const shareID = testData.shares.some_share.share_id
		const songID = testData.songs.song4_library_user2.song_id
		const query = makeUpdateSongMutation(shareID, songID, input)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse({ updateSong: null }, [{ message: `Users access to this song is permitted!` }]),
		)
	})
})

describe("remove song from library", () => {
	const makeRemoveSongFromLibraryMutation = (libraryID: string, songID: string) => `
		mutation {
			removeSongFromLibrary(input: {shareID: "${libraryID}", songID: "${songID}"})
		}
	`

	test("deeply linked song is successfully copied and referenced", async () => {
		const { graphQLServer, songService, playlistService } = await setupTest({})

		const song = testData.songs.song2_library_user1
		const shareID = testData.shares.library_user1.share_id
		const query = makeRemoveSongFromLibraryMutation(shareID, song.song_id)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.removeSongFromLibrary).toBeTrue()

		const ownLibrarySongs = await songService.getByShare(shareID)
		expect(ownLibrarySongs.map((song) => song.id)).not.toContain(song.song_id)

		const playlistID = testData.playlists.playlist1_library_user1.playlist_id
		const playlistSongs = await playlistService.getSongs(playlistID)
		expect(playlistSongs.map((song) => song.id)).not.toContain(song.song_id)

		const foreignLibrarySongs = await songService.getByShare(testData.shares.library_user2.share_id)
		expect(foreignLibrarySongs.map((song) => song.title)).toContain(song.title)

		const someSharePlaylistSongs = await playlistService.getSongs(
			testData.playlists.playlist_some_shared_library.playlist_id,
		)
		expect(someSharePlaylistSongs.map((song) => song.title)).not.toContain(song.title)
	})

	test("song of linked library not permitted", async () => {
		const { graphQLServer } = await setupTest({})

		const songID = testData.songs.song4_library_user2.song_id
		const shareID = testData.shares.library_user2.share_id
		const query = makeRemoveSongFromLibraryMutation(shareID, songID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(null, [{ message: `User has insufficient permissions to perform this action!` }]),
		)
	})

	test("song of foreign library not permitted", async () => {
		const { graphQLServer } = await setupTest({})

		const songID = testData.songs.song5_library_user3.song_id
		const shareID = testData.shares.some_unrelated_library.share_id
		const query = makeRemoveSongFromLibraryMutation(shareID, songID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(null, [{ message: `User has insufficient permissions to perform this action!` }]),
		)
	})
})

describe("increase play count", () => {
	const makeIncreaseSongPlayCountMutation = (shareID: string, songID: string) => `
		mutation {
			incrementSongPlayCount(input: {shareID: "${shareID}", songID: "${songID}"}){
				user{
					id
				}
				song{
					id
				}
				dateAdded
			}
		}
	`
	const shareID = testData.shares.library_user1.share_id

	test("existing song id succeeds", async () => {
		const { graphQLServer, database } = await setupTest({})

		const songID = testData.songs.song1_library_user1.song_id
		const query = makeIncreaseSongPlayCountMutation(shareID, songID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.incrementSongPlayCount).toMatchObject({
			user: { id: testData.users.user1.user_id },
			song: { id: songID },
			dateAdded: expect.toBeString(),
		})

		const rawResults = await database.query(
			ShareSongsTable.select("*", ["song_id_ref", "share_id_ref"])([songID, shareID]),
		)
		expect(rawResults[0].play_count).toBe(1)
	})

	test("not existing song id fails", async () => {
		const { graphQLServer } = await setupTest({})

		const songID = uuid()
		const query = makeIncreaseSongPlayCountMutation(shareID, songID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(null, [{ message: `Song with id ${songID} not found in share ${shareID}` }]),
		)
	})

	test("foreign existing song id fails", async () => {
		const { graphQLServer } = await setupTest({})

		const songID = testData.songs.song5_library_user3.song_id
		const query = makeIncreaseSongPlayCountMutation(shareID, songID)

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body).toMatchObject(
			makeGraphQLResponse(null, [{ message: `Song with id ${songID} not found in share ${shareID}` }]),
		)
	})
})

describe("submit remote file", () => {
	const makeSubmitRemoteFileMutation = (filename: string, remoteFileUrl: string, playlistIDs: string[] = []) => `
		mutation {
			submitSongFromRemoteFile(input: {filename: "${filename}", remoteFileUrl: "${remoteFileUrl}", playlistIDs: [${playlistIDs.map(
		(id) => `"${id}"`,
	)}]}){${shareSongKeys}}
		}
	`

	test("valid url succeeds", async () => {
		const {
			graphQLServer,
			services: { songFileService },
		} = await setupTest({})

		const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")
		const filenameRemote = uuid().split("-").join("") + ".mp3"

		await songFileService.uploadFile({
			filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})
		const uploadLink = await songFileService.getLinkToFile({
			filenameRemote,
			expireDate: moment().add(1, "minute"),
			permission: "write",
		})

		const query = makeSubmitRemoteFileMutation("SampleAudio.mp3", uploadLink, [])

		const { body } = await executeGraphQLQuery({ graphQLServer, query })

		expect(body.data.submitSongFromRemoteFile).toBeObject()
	})

	test("invalid filename fails", async () => {
		const {
			graphQLServer,
			services: { songFileService },
		} = await setupTest({})

		const filenameRemote = uuid().split("-").join("") + ".mp3"

		const uploadLink = await songFileService.getLinkToFile({
			filenameRemote,
			expireDate: moment().add(1, "minute"),
			permission: "write",
		})

		const query1 = makeSubmitRemoteFileMutation("some/dir/SampleAudio.mp3", uploadLink, [])
		const { body: body1 } = await executeGraphQLQuery({ graphQLServer, query: query1 })
		expect(body1).toMatchObject(makeGraphQLResponse(null, [{ message: `<filename> is not valid` }]))

		const query2 = makeSubmitRemoteFileMutation("SampleAudio", uploadLink, [])
		const { body: body2 } = await executeGraphQLQuery({ graphQLServer, query: query2 })
		expect(body2).toMatchObject(makeGraphQLResponse(null, [{ message: `<filename> is not valid` }]))
	})

	test("insufficient permissions fails", async () => {
		const {
			graphQLServer,
			services: { songFileService },
		} = await setupTest({})

		const filenameRemote = uuid().split("-").join("") + ".mp3"
		const scopes = makeAllScopes()
		scopes[0].permissions = scopes[0].permissions.filter((permission) => permission !== Permissions.SONG_UPLOAD)

		const uploadLink = await songFileService.getLinkToFile({
			filenameRemote,
			expireDate: moment().add(1, "minute"),
			permission: "write",
		})

		const query = makeSubmitRemoteFileMutation("SampleAudio.mp3", uploadLink, [])

		const { body } = await executeGraphQLQuery({ graphQLServer, query, scopes })

		expect(body).toMatchObject(insufficientPermissionsError())
	})
})
