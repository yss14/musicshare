// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import * as express from 'express';
import { AuthenticationService } from '../auth/AuthenticationService';
import { makeAuthExtractor, auth, graphQLAuthChecker } from '../auth/auth-middleware';
import { testData } from '../database/seed';
import { User } from '../models/UserModel';
import { HTTPStatusCodes } from '../types/http-status-codes';
import supertest = require('supertest');
import { Resolver, Authorized, Query, ObjectType, Field, Arg } from 'type-graphql';
import { makeGraphQLServer } from '../server/GraphQLServer';
import { makeGraphQLResponse } from './utils/graphql';
import { makeGraphQLContextProvider, Scopes } from "../types/context";
import { Permission } from "../auth/permissions";
import { makeAllScopes } from "./utils/setup-test-env";
import { hasAllPermissions, getShareIDFromRequest, getPlaylistIDFromRequest, getSongIDFromRequest, getCurrentPermissionsForShare } from "../auth/middleware/auth-selectors";
import { Share } from "../models/ShareModel";
import { TimeUUID } from "../types/TimeUUID";
import { Playlist } from "../models/PlaylistModel";
import { shareSongFromDBResult } from "../models/SongModel";

const routePathProtected = '/some/protected/route';
const routePathPublic = '/some/public/route';

@ObjectType()
class TestRouteReturnValue {
	@Field()
	public readonly message!: string;
}

const testRouteReturnValue: TestRouteReturnValue = { message: 'Hello test case!' };

const setupExpressTestEnv = async () => {
	const authService = new AuthenticationService('topsecret');
	const expressApp = express();
	expressApp.use(makeAuthExtractor(authService) as any);
	expressApp.post(routePathProtected, auth as any, (req, res) => res.status(HTTPStatusCodes.OK).json(testRouteReturnValue));
	expressApp.post(routePathPublic, (req, res) => res.status(HTTPStatusCodes.OK).json(testRouteReturnValue));

	return { expressApp, authService };
}

const setupGraphQLTestEnv = async () => {
	const { expressApp, authService } = await setupExpressTestEnv();

	@Resolver(of => TestRouteReturnValue)
	class TestResolver {
		@Query(() => TestRouteReturnValue)
		public publicQuery(
			@Arg('from', { nullable: true }) from?: number,
		): TestRouteReturnValue {
			return testRouteReturnValue;
		}

		@Authorized()
		@Query(() => TestRouteReturnValue)
		public privateQuery(
			@Arg('from', { nullable: true }) from?: number,
		): TestRouteReturnValue {
			return testRouteReturnValue;
		}
	}

	const graphQLServer = await makeGraphQLServer(
		null as any,
		makeGraphQLContextProvider({ playlistService: null as any, songService: null as any, shareService: null as any }),
		graphQLAuthChecker,
		TestResolver
	);
	graphQLServer.applyMiddleware({ app: expressApp });

	return { expressApp, graphQLServer, authService };
}

const setupSupertest = (expressApp: express.Application, authToken: string | undefined, route: string) => {
	const request = supertest(expressApp).post(route);

	if (authToken) {
		request.set('Authorization', authToken);
	}

	return request;
}

const user = User.fromDBResult(testData.users.user1);

describe('express middleware', () => {
	const executeTestRequests = async (expressApp: express.Application, authToken: string | undefined, statusProtected: HTTPStatusCodes, statusPublic: HTTPStatusCodes) => {
		const requestProtected = setupSupertest(expressApp, authToken, routePathProtected);
		const responseProtected = await requestProtected.send();

		expect(responseProtected.status).toBe(statusProtected);
		if (statusProtected === HTTPStatusCodes.OK) {
			expect(responseProtected.body).toEqual(testRouteReturnValue);
		}

		const requestPublic = setupSupertest(expressApp, authToken, routePathPublic);
		const responsePublic = await requestPublic.send();

		expect(responsePublic.status).toBe(statusPublic);
		if (statusPublic === HTTPStatusCodes.OK) {
			expect(responsePublic.body).toEqual(testRouteReturnValue);
		}
	}

	test('valid token', async () => {
		const { authService, expressApp } = await setupExpressTestEnv();
		const authToken = await authService.issueToken(user, []);

		await executeTestRequests(expressApp, authToken, HTTPStatusCodes.OK, HTTPStatusCodes.OK);
	});

	test('invalid token', async () => {
		const { authService, expressApp } = await setupExpressTestEnv();
		const authToken = (await authService.issueToken(user, [])) + 'a';

		await executeTestRequests(expressApp, authToken, HTTPStatusCodes.UNAUTHORIZED, HTTPStatusCodes.OK);
	});

	test('no token', async () => {
		const { expressApp } = await setupExpressTestEnv();
		const authToken = undefined;

		await executeTestRequests(expressApp, authToken, HTTPStatusCodes.UNAUTHORIZED, HTTPStatusCodes.OK);
	});
});

describe('graphql middleware', () => {
	const executeTestRequests = async (expressApp: express.Application, authToken: string | undefined, protectedSuccess?: boolean) => {
		const publicQuery = `
			query{
				publicQuery(from: 1){message}
			}
		`;
		const privateQuery = `
			query{
				privateQuery(from: 1){message}
			}
		`;

		const requestProtected = setupSupertest(expressApp, authToken, '/graphql');
		const responseProtected = await requestProtected.send({ query: privateQuery });

		expect(responseProtected.status).toBe(HTTPStatusCodes.OK);
		if (protectedSuccess) {
			expect(responseProtected.body).toEqual(makeGraphQLResponse({ privateQuery: testRouteReturnValue }));
		} else {
			expect(responseProtected.body).toMatchObject(makeGraphQLResponse(
				null,
				[{ message: `Access denied! You need to be authorized to perform this action!` }]
			));
		}

		const requestPublic = setupSupertest(expressApp, authToken, '/graphql');
		const responsePublic = await requestPublic.send({ query: publicQuery });

		expect(responsePublic.status).toBe(HTTPStatusCodes.OK);
		expect(responsePublic.body).toEqual(makeGraphQLResponse({ publicQuery: testRouteReturnValue }));
	}

	test('valid token', async () => {
		const { expressApp, authService } = await setupGraphQLTestEnv();
		const authToken = await authService.issueToken(user, []);

		await executeTestRequests(expressApp, authToken, true);
	});

	test('invalid token', async () => {
		const { expressApp, authService } = await setupGraphQLTestEnv();
		const authToken = (await authService.issueToken(user, [])) + 'a';

		await executeTestRequests(expressApp, authToken, false);
	});

	test('no token', async () => {
		const { expressApp } = await setupGraphQLTestEnv();

		await executeTestRequests(expressApp, undefined, false);
	});
});

describe('permissions', () => {
	test('has a single permission', () => {
		const requiredPermissions: Permission[] = ['playlist:create'];
		const currentPermissions: Permission[] = makeAllScopes()[0].permissions;

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(true);
	});

	test('has multiple permission', () => {
		const requiredPermissions: Permission[] = ['playlist:create', 'playlist:modify', 'playlist:mutate_songs'];
		const currentPermissions: Permission[] = makeAllScopes()[0].permissions;

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(true);
	});

	test('has insufficient permissions empty', () => {
		const requiredPermissions: Permission[] = ['playlist:create'];
		const currentPermissions: Permission[] = [];

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(false);
	});

	test('has insufficient permissions no intersection', () => {
		const requiredPermissions: Permission[] = ['playlist:create'];
		const currentPermissions: Permission[] = ['playlist:modify', 'playlist:mutate_songs'];

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(false);
	});

	test('has insufficient permissions one missing', () => {
		const requiredPermissions: Permission[] = ['playlist:create', 'playlist:mutate_songs'];
		const currentPermissions: Permission[] = ['playlist:modify', 'playlist:mutate_songs'];

		expect(hasAllPermissions(requiredPermissions, currentPermissions)).toBe(false);
	});
});

describe('auth selectors', () => {
	describe('share', () => {
		const share = testData.shares.library_user1;

		test('root', () => {
			const req = { args: {}, root: Share.fromDBResult(share) };
			const shareID = getShareIDFromRequest(req);

			expect(shareID).toBe(share.id.toString());
		});

		test('args', () => {
			const req = { args: { shareID: share.id.toString() }, root: undefined };
			const shareID = getShareIDFromRequest(req);

			expect(shareID).toBe(share.id.toString());
		});

		test('not found', () => {
			const req = { args: { otherID: TimeUUID().toString() }, root: User.fromDBResult(testData.users.user1) };
			const shareID = getShareIDFromRequest(req);

			expect(shareID).toBeNull();
		});
	});

	describe('playlist', () => {
		const playlist = testData.playlists.playlist1_library_user1;

		test('root', () => {
			const req = { args: {}, root: Playlist.fromDBResult(playlist) };
			const playlistID = getPlaylistIDFromRequest(req);

			expect(playlistID).toBe(playlist.id.toString());
		});

		test('args', () => {
			const req = { args: { playlistID: playlist.id.toString() }, root: undefined };
			const playlistID = getPlaylistIDFromRequest(req);

			expect(playlistID).toBe(playlist.id.toString());
		});

		test('not found', () => {
			const req = { args: { otherID: TimeUUID().toString() }, root: User.fromDBResult(testData.users.user1) };
			const playlistID = getPlaylistIDFromRequest(req);

			expect(playlistID).toBeNull();
		});
	});

	describe('song', () => {
		const song = testData.songs.song1_library_user1;

		test('root', () => {
			const req = { args: {}, root: shareSongFromDBResult(song) };
			const songID = getSongIDFromRequest(req);

			expect(songID).toBe(song.id.toString());
		});

		test('args', () => {
			const req = { args: { songID: song.id.toString() }, root: undefined };
			const songID = getSongIDFromRequest(req);

			expect(songID).toBe(song.id.toString());
		});

		test('not found', () => {
			const req = { args: { otherID: TimeUUID().toString() }, root: User.fromDBResult(testData.users.user1) };
			const songID = getSongIDFromRequest(req);

			expect(songID).toBeNull();
		});
	});
});

describe('get permission from scope', () => {
	const shareID1 = testData.shares.library_user1.id.toString();
	const shareID2 = testData.shares.some_shared_library.id.toString();
	const shareID3 = testData.shares.library_user2.id.toString();
	const scopes: Scopes = [
		{ shareID: shareID1, permissions: ['playlist:create', 'playlist:modify', 'song:modify'] },
		{ shareID: shareID3, permissions: ['playlist:modify', 'song:upload', 'song:modify'] },
	];

	test('share exists', () => {
		const permissions = getCurrentPermissionsForShare(shareID1, scopes);

		expect(permissions).toEqual(scopes[0].permissions);
	});

	test('share does not exist', () => {
		expect(() => getCurrentPermissionsForShare(shareID2, scopes))
			.toThrowError(`No scopes provided for share ${shareID2}`);
	});
});