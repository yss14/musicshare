import "reflect-metadata"
import express from "express"
import { AuthenticationService } from "../auth/AuthenticationService"
import { makeAuthExtractor, graphQLAuthChecker } from "../auth/auth-middleware"
import { testData } from "../database/seed"
import { Viewer } from "../models/UserModel"
import { HTTPStatusCodes } from "../types/http-status-codes"
import supertest = require("supertest")
import { Resolver, Authorized, Query, ObjectType, Field } from "type-graphql"
import { makeGraphQLServer } from "../server/GraphQLServer"
import { makeGraphQLResponse } from "./utils/graphql"
import { makeGraphQLContextProvider, Scopes, IGraphQLContext } from "../types/context"
import { Permission, Permissions } from "@musicshare/shared-types"
import { makeAllScopes } from "./utils/setup-test-env"
import {
	hasAllPermissions,
	getShareIDFromRequest,
	getPlaylistIDFromRequest,
	getSongIDFromRequest,
	getCurrentPermissionsForShare,
} from "../auth/middleware/auth-selectors"
import { Share } from "../models/ShareModel"
import { Playlist } from "../models/PlaylistModel"
import { makeShareAuthMiddleware } from "../auth/middleware/share-auth"
import { ShareNotFoundError, ShareService, IShareService } from "../services/ShareService"
import { makeMockedDatabase } from "./mocks/mock-database"
import { makePlaylistAuthMiddleware } from "../auth/middleware/playlist-auth"
import { makeSongAuthMiddleware } from "../auth/middleware/song-auth"
import { configFromEnv } from "../types/config"
import { ShareSong } from "../models/SongModel"
import { v4 as uuid } from "uuid"
import { ShareServiceMock } from "./mocks/ShareServiceMock"
import { IPermissionService } from "../services/PermissionsService"
import { config } from "aws-sdk"

@ObjectType()
class TestRouteReturnValue {
	@Field()
	public readonly message!: string
}

const testRouteReturnValue: TestRouteReturnValue = { message: "Hello test case!" }

const makePermissionServiceMock = (): IPermissionService => ({
	addPermissionsForUser: jest.fn(),
	getAvailablePermissions: jest.fn(),
	getPermissionsForUser: jest.fn(),
	getPermissionsForUserShares: jest.fn(async () => {
		return [
			{
				shareID: testData.shares.library_user1.share_id,
				permissions: Permissions.ALL,
			},
			{
				shareID: testData.shares.some_share.share_id,
				permissions: Permissions.ALL,
			},
		]
	}),
})

const setupExpressTestEnv = async () => {
	const authService = new AuthenticationService("topsecret")
	const permissionService = makePermissionServiceMock()
	const shareServiceMock: IShareService = new ShareServiceMock([])
	shareServiceMock.getUserLibrary = jest.fn(async () => (null as unknown) as Share)
	const expressApp = express()
	expressApp.use(makeAuthExtractor(authService, permissionService, shareServiceMock) as any)

	return { expressApp, authService, permissionService }
}

const setupGraphQLTestEnv = async () => {
	const { expressApp, ...expressTestEnv } = await setupExpressTestEnv()

	@Resolver(() => TestRouteReturnValue)
	class TestResolver {
		@Query(() => TestRouteReturnValue)
		public publicQuery(): TestRouteReturnValue {
			return testRouteReturnValue
		}

		@Authorized()
		@Query(() => TestRouteReturnValue)
		public privateQuery(): TestRouteReturnValue {
			return testRouteReturnValue
		}
	}

	const graphQLServer = await makeGraphQLServer(
		null as any,
		makeGraphQLContextProvider({} as any),
		configFromEnv(),
		graphQLAuthChecker,
		TestResolver,
	)
	graphQLServer.applyMiddleware({ app: expressApp })

	return { expressApp, graphQLServer, ...expressTestEnv }
}

const setupSupertest = (expressApp: express.Application, authToken: string | undefined, route: string) => {
	const request = supertest(expressApp).post(route)

	if (authToken) {
		request.set("Authorization", authToken)
	}

	return request
}

const user = Viewer.fromDBResult(testData.users.user1)

describe("native type-graphql auth middleware", () => {
	const executeTestRequests = async (
		expressApp: express.Application,
		authToken: string | undefined,
		protectedSuccess?: boolean,
		message?: string,
	) => {
		const publicQuery = `
			query{
				publicQuery{message}
			}
		`
		const privateQuery = `
			query{
				privateQuery{message}
			}
		`

		const requestProtected = setupSupertest(expressApp, authToken, "/graphql")
		const responseProtected = await requestProtected.send({ query: privateQuery })

		expect(responseProtected.status).toBe(HTTPStatusCodes.OK)
		if (protectedSuccess) {
			expect(responseProtected.body).toEqual(makeGraphQLResponse({ privateQuery: testRouteReturnValue }))
		} else {
			expect(responseProtected.body).toMatchObject(
				makeGraphQLResponse(null, [
					{ message: message || `Access denied! You need to be authorized to perform this action!` },
				]),
			)
		}

		const requestPublic = setupSupertest(expressApp, authToken, "/graphql")
		const responsePublic = await requestPublic.send({ query: publicQuery })

		expect(responsePublic.status).toBe(HTTPStatusCodes.OK)
		expect(responsePublic.body).toEqual(makeGraphQLResponse({ publicQuery: testRouteReturnValue }))
	}

	test("valid token", async () => {
		const { expressApp, authService } = await setupGraphQLTestEnv()
		const authToken = await authService.issueAuthToken(user, [], "some_refresh_token")

		await executeTestRequests(expressApp, authToken, true)
	})

	test("invalid token", async () => {
		const { expressApp, authService } = await setupGraphQLTestEnv()
		const authToken = (await authService.issueAuthToken(user, [], "some_refresh_token")) + "a"

		await executeTestRequests(expressApp, authToken, false)
	})

	test("no token", async () => {
		const { expressApp } = await setupGraphQLTestEnv()

		await executeTestRequests(expressApp, undefined, false)
	})
})

describe("permissions", () => {
	test("has a single permission", () => {
		const requiredPermissions: Permission[] = ["playlist:create"]
		const currentPermissions: Permission[] = makeAllScopes()[0].permissions

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(true)
	})

	test("has multiple permission", () => {
		const requiredPermissions: Permission[] = ["playlist:create", "playlist:modify", "playlist:mutate_songs"]
		const currentPermissions: Permission[] = makeAllScopes()[0].permissions

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(true)
	})

	test("has insufficient permissions empty", () => {
		const requiredPermissions: Permission[] = ["playlist:create"]
		const currentPermissions: Permission[] = []

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(false)
	})

	test("has insufficient permissions no intersection", () => {
		const requiredPermissions: Permission[] = ["playlist:create"]
		const currentPermissions: Permission[] = ["playlist:modify", "playlist:mutate_songs"]

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(false)
	})

	test("has insufficient permissions one missing", () => {
		const requiredPermissions: Permission[] = ["playlist:create", "playlist:mutate_songs"]
		const currentPermissions: Permission[] = ["playlist:modify", "playlist:mutate_songs"]

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(false)
	})
})

describe("auth selectors", () => {
	describe("share", () => {
		const share = testData.shares.library_user1

		test("root", () => {
			const req = { args: {}, root: Share.fromDBResult(share) }
			const shareID = getShareIDFromRequest(req)

			expect(shareID).toBe(share.share_id.toString())
		})

		test("args", () => {
			const req = { args: { shareID: share.share_id.toString() }, root: undefined }
			const shareID = getShareIDFromRequest(req)

			expect(shareID).toBe(share.share_id.toString())
		})

		test("not found", () => {
			const req = { args: { otherID: uuid().toString() }, root: Viewer.fromDBResult(testData.users.user1) }
			const shareID = getShareIDFromRequest(req)

			expect(shareID).toBeNull()
		})
	})

	describe("playlist", () => {
		const playlist = testData.playlists.playlist1_library_user1
		const shareID = testData.shares.library_user1.share_id

		test("root", () => {
			const req = { args: {}, root: Playlist.fromDBResult(playlist, shareID) }
			const playlistID = getPlaylistIDFromRequest(req)

			expect(playlistID).toBe(playlist.playlist_id.toString())
		})

		test("args", () => {
			const req = { args: { playlistID: playlist.playlist_id.toString() }, root: undefined }
			const playlistID = getPlaylistIDFromRequest(req)

			expect(playlistID).toBe(playlist.playlist_id.toString())
		})

		test("not found", () => {
			const req = { args: { otherID: uuid().toString() }, root: Viewer.fromDBResult(testData.users.user1) }
			const playlistID = getPlaylistIDFromRequest(req)

			expect(playlistID).toBeNull()
		})
	})

	describe("song", () => {
		const song = testData.songs.song1_library_user1
		const shareID = testData.shares.library_user1.share_id

		test("root", () => {
			const req = { args: {}, root: ShareSong.fromDBResult(song, shareID, shareID) }
			const songID = getSongIDFromRequest(req)

			expect(songID).toBe(song.song_id.toString())
		})

		test("args", () => {
			const req = { args: { songID: song.song_id.toString() }, root: undefined }
			const songID = getSongIDFromRequest(req)

			expect(songID).toBe(song.song_id.toString())
		})

		test("not found", () => {
			const req = { args: { otherID: uuid().toString() }, root: Viewer.fromDBResult(testData.users.user1) }
			const songID = getSongIDFromRequest(req)

			expect(songID).toBeNull()
		})
	})
})

describe("auth middleware", () => {
	const makeContext = (context?: Partial<IGraphQLContext>): IGraphQLContext => ({
		scopes: [],
		services: {} as any,
		userID: null,
		...(context || {}),
	})

	describe("share", () => {
		test("reference not found", async () => {
			const middleware = makeShareAuthMiddleware({}) as Function
			const req = { args: {}, root: undefined, context: makeContext() }

			await expect(middleware(req)).rejects.toThrowError("Share reference not found")
		})

		test("insufficient permissions", async () => {
			const shareID = testData.shares.library_user1.share_id.toString()
			const scopes: Scopes = [{ shareID, permissions: ["playlist:create", "playlist:modify"] }]
			const middleware = makeShareAuthMiddleware({ checkRef: false, permissions: ["share:owner"] }) as Function
			const req = { args: { shareID }, root: undefined, context: makeContext({ scopes }) }

			await expect(middleware(req)).rejects.toThrowError(
				"User has insufficient permissions to perform this action!",
			)
		})

		test("check ref defaults to true", async () => {
			const database = makeMockedDatabase()
			;(database.query as jest.Mock).mockReturnValue([])
			const shareService = ShareService(database, jest.fn(), {} as any)

			const shareID = uuid()
			const middleware = makeShareAuthMiddleware({}) as Function
			const context = makeContext({})
			const req = {
				args: { shareID },
				root: undefined,
				context: { ...context, services: { ...context.services, shareService } },
			}

			await expect(middleware(req)).rejects.toThrowError(ShareNotFoundError)
		})
	})

	describe("playlist", () => {
		const shareID = testData.shares.library_user1.share_id.toString()

		test("share reference not found", async () => {
			const middleware = makePlaylistAuthMiddleware({}) as Function
			const req = { args: {}, root: undefined, context: makeContext() }

			await expect(middleware(req)).rejects.toThrowError("Share reference not found")
		})

		test("playlist reference not found", async () => {
			const middleware = makePlaylistAuthMiddleware({}) as Function
			const req = { args: { shareID }, root: undefined, context: makeContext() }

			await expect(middleware(req)).rejects.toThrowError("Playlist reference not found")
		})
	})

	describe("song", () => {
		const songID = testData.songs.song1_library_user1.song_id.toString()

		test("song reference not found", async () => {
			const middleware = makeSongAuthMiddleware([]) as Function
			const req = { args: {}, root: undefined, context: makeContext() }

			await expect(middleware(req)).rejects.toThrowError("Song reference not found")
		})

		test("share reference not found", async () => {
			const middleware = makeSongAuthMiddleware([]) as Function
			const req = { args: { songID }, root: undefined, context: makeContext() }

			await expect(middleware(req)).rejects.toThrowError("Share reference not found")
		})
	})
})

describe("get permission from scope", () => {
	const shareID1 = testData.shares.library_user1.share_id.toString()
	const shareID2 = testData.shares.some_share.share_id.toString()
	const shareID3 = testData.shares.library_user2.share_id.toString()
	const scopes: Scopes = [
		{ shareID: shareID1, permissions: ["playlist:create", "playlist:modify", "song:modify"] },
		{ shareID: shareID3, permissions: ["playlist:modify", "song:upload", "song:modify"] },
	]

	test("share exists", () => {
		const permissions = getCurrentPermissionsForShare(shareID1, scopes)

		expect(permissions).toEqual(scopes[0].permissions)
	})

	test("share does not exist", () => {
		expect(() => getCurrentPermissionsForShare(shareID2, scopes)).toThrowError(
			`No scopes provided for share ${shareID2}`,
		)
	})
})
