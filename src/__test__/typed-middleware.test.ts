import { wrapRequestHandler } from "../utils/typed-express/request-handler";
import { withMiddleware } from "../utils/typed-express/typed-middleware";
import express = require("express");
import { Either, left, right } from "../types/Either";
import { IResponse, ResponseError, ResponseSuccessJSON } from "../utils/typed-express/responses";
import { HTTPStatusCodes } from "../types/http-status-codes";
import { makeExpressApp } from "./utils/make-express-app";
import supertest = require("supertest");
import * as BodyParser from "body-parser";

const firstMiddlewareError = { identifier: '1', message: '<someNumber> is not a valid number' };
const firstMiddleware = async (req: express.Request): Promise<Either<IResponse, number>> => {
	const { someNumber } = req.body;

	if (typeof someNumber === 'number') {
		return right(someNumber);
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, firstMiddlewareError));
	}
}

const secondMiddlewareError = { identifier: '2', message: '<someString> is not a valid number' };
const secondMiddleware = async (req: express.Request): Promise<Either<IResponse, string>> => {
	const { someString } = req.body;

	if (typeof someString === 'string') {
		return right(someString);
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, secondMiddlewareError));
	}
}

const thirdMiddlewareError = { identifier: '3', message: '<someBoolean> is not a valid number' };
const thirdMiddleware = async (req: express.Request): Promise<Either<IResponse, boolean>> => {
	const { someBoolean } = req.body;

	if (typeof someBoolean === 'boolean') {
		return right(someBoolean);
	} else {
		return left(ResponseError(HTTPStatusCodes.BAD_REQUEST, thirdMiddlewareError));
	}
}

const jsonBodyParser = BodyParser.json();

afterAll(async () => {
	await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
})

test('one parameter success', async () => {
	const testRoute = wrapRequestHandler(withMiddleware(firstMiddleware)(
		async (req, v1) => ResponseSuccessJSON(HTTPStatusCodes.OK, { v1 })
	));
	const router = express.Router().post('/testroute', testRoute);
	const expressApp = makeExpressApp({ routers: [router], middleware: [jsonBodyParser] });

	const httpResponse = await supertest(expressApp)
		.post('/testroute')
		.send({ someNumber: 42 });

	expect(httpResponse.status).toBe(HTTPStatusCodes.OK);
	expect(httpResponse.body).toEqual({ v1: 42 });
});

test('one parameter failing', async () => {
	const testRoute = wrapRequestHandler(withMiddleware(firstMiddleware)(
		async (req, v1) => ResponseSuccessJSON(HTTPStatusCodes.OK, { v1 })
	));
	const router = express.Router().post('/testroute', testRoute);
	const expressApp = makeExpressApp({ routers: [router], middleware: [jsonBodyParser] });

	const httpResponse = await supertest(expressApp)
		.post('/testroute')
		.send({ someNumber: '42' });

	expect(httpResponse.status).toBe(HTTPStatusCodes.BAD_REQUEST);
	expect(httpResponse.body).toEqual({ error: firstMiddlewareError });
});

test('two parameters success', async () => {
	const testRoute = wrapRequestHandler(withMiddleware(firstMiddleware, secondMiddleware)(
		async (req, v1, v2) => ResponseSuccessJSON(HTTPStatusCodes.OK, { v1, v2 })
	));
	const router = express.Router().post('/testroute', testRoute);
	const expressApp = makeExpressApp({ routers: [router], middleware: [jsonBodyParser] });

	const httpResponse = await supertest(expressApp)
		.post('/testroute')
		.send({ someNumber: 42, someString: 'helloworld' });

	expect(httpResponse.status).toBe(HTTPStatusCodes.OK);
	expect(httpResponse.body).toEqual({ v1: 42, v2: 'helloworld' });
});

test('two parameters failing', async () => {
	const testRoute = wrapRequestHandler(withMiddleware(firstMiddleware, secondMiddleware)(
		async (req, v1, v2) => ResponseSuccessJSON(HTTPStatusCodes.OK, { v1, v2 })
	));
	const router = express.Router().post('/testroute', testRoute);
	const expressApp = makeExpressApp({ routers: [router], middleware: [jsonBodyParser] });

	const httpResponse = await supertest(expressApp)
		.post('/testroute')
		.send({ someNumber: 42, someString: false });

	expect(httpResponse.status).toBe(HTTPStatusCodes.BAD_REQUEST);
	expect(httpResponse.body).toEqual({ error: secondMiddlewareError });
});

test('three parameters success', async () => {
	const testRoute = wrapRequestHandler(withMiddleware(firstMiddleware, secondMiddleware, thirdMiddleware)(
		async (req, v1, v2, v3) => ResponseSuccessJSON(HTTPStatusCodes.OK, { v1, v2, v3 })
	));
	const router = express.Router().post('/testroute', testRoute);
	const expressApp = makeExpressApp({ routers: [router], middleware: [jsonBodyParser] });

	const httpResponse = await supertest(expressApp)
		.post('/testroute')
		.send({ someNumber: 42, someString: 'helloworld', someBoolean: false });

	expect(httpResponse.status).toBe(HTTPStatusCodes.OK);
	expect(httpResponse.body).toEqual({ v1: 42, v2: 'helloworld', v3: false });
});

test('three parameters failing', async () => {
	const testRoute = wrapRequestHandler(withMiddleware(firstMiddleware, secondMiddleware, thirdMiddleware)(
		async (req, v1, v2, v3) => ResponseSuccessJSON(HTTPStatusCodes.OK, { v1, v2, v3 })
	));
	const router = express.Router().post('/testroute', testRoute);
	const expressApp = makeExpressApp({ routers: [router], middleware: [jsonBodyParser] });

	const httpResponse = await supertest(expressApp)
		.post('/testroute')
		.send({ someNumber: 42, someString: 'helloworld', someBoolean: '42' });

	expect(httpResponse.status).toBe(HTTPStatusCodes.BAD_REQUEST);
	expect(httpResponse.body).toEqual({ error: thirdMiddlewareError });
});