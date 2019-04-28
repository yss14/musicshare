import * as express from 'express';
import { AuthenticationService } from '../auth/AuthenticationService';
import { makeAuthExtractor, auth } from '../auth/auth-middleware';
import { testData } from '../database/seed';
import { User } from '../models/UserModel';
import { HTTPStatusCodes } from '../types/http-status-codes';
import supertest = require('supertest');

const routePathProtected = '/some/protected/route';
const routePathPublic = '/some/public/route';
const testRouteReturnValue = { message: 'Hello test case!' };

const setupTestEnv = async () => {
	const authService = new AuthenticationService('topsecret');
	const expressApp = express();
	expressApp.use(makeAuthExtractor(authService) as any);
	expressApp.post(routePathProtected, auth as any, (req, res) => res.status(HTTPStatusCodes.OK).json(testRouteReturnValue));
	expressApp.post(routePathPublic, (req, res) => res.status(HTTPStatusCodes.OK).json(testRouteReturnValue));

	return { expressApp, authService };
}

describe('express middleware', () => {
	const user = User.fromDBResult(testData.users.user1);

	const executeTestRequests = async (expressApp: express.Application, authToken: string | undefined, statusProtected: HTTPStatusCodes, statusPublic: HTTPStatusCodes) => {
		const requestProtected = supertest(expressApp).post(routePathProtected);

		if (authToken) {
			requestProtected.set('Authorization', authToken);
		}

		const responseProtected = await requestProtected.send();

		expect(responseProtected.status).toBe(statusProtected);
		if (statusProtected === HTTPStatusCodes.OK) {
			expect(responseProtected.body).toEqual(testRouteReturnValue);
		}

		const requestPublic = supertest(expressApp).post(routePathPublic);

		if (authToken) {
			requestPublic.set('Authorization', authToken);
		}

		const responsePublic = await requestPublic.send();

		expect(responsePublic.status).toBe(statusPublic);
		if (statusPublic === HTTPStatusCodes.OK) {
			expect(responsePublic.body).toEqual(testRouteReturnValue);
		}
	}

	test('valid token', async () => {
		const { authService, expressApp } = await setupTestEnv();
		const authToken = await authService.issueToken(user, []);

		await executeTestRequests(expressApp, authToken, HTTPStatusCodes.OK, HTTPStatusCodes.OK);
	});

	test('invalid token', async () => {
		const { authService, expressApp } = await setupTestEnv();
		const authToken = (await authService.issueToken(user, [])) + 'a';

		await executeTestRequests(expressApp, authToken, HTTPStatusCodes.UNAUTHORIZED, HTTPStatusCodes.OK);
	});

	test('no token', async () => {
		const { expressApp } = await setupTestEnv();
		const authToken = undefined;

		await executeTestRequests(expressApp, authToken, HTTPStatusCodes.UNAUTHORIZED, HTTPStatusCodes.OK);
	});
});

describe('graphql middleware', () => {
	test('valid token', async () => {

	});

	test('invalid token', async () => {

	});

	test('no token', async () => {

	});
});