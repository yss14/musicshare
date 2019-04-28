import supertest = require("supertest");
import { HTTPStatusCodes } from "../../types/http-status-codes";
import { jsonParsedObject } from "./json-parsed-object";
import { ApolloServer } from "apollo-server-express";
import * as express from 'express';

export const executeGraphQLQuery = async (server: ApolloServer, query: string, expectedHTTPCode: HTTPStatusCodes = 200) => {
	const expressApp = express();

	const httpResponse = await supertest(expressApp)
		.post('/')
		.set('Accept', 'application/json')
		.send({ query })
		.expect((res) => res.status !== expectedHTTPCode ? console.log(res.body) : 0)
		.expect(expectedHTTPCode)
		.expect('Content-Type', /json/);

	return httpResponse;
}

interface IGraphQLResponse<T> {
	data: T;
	errors?: any[];
}

export const makeGraphQLResponse = <T>(expectedData: T, expectedErrors?: any[]) => {
	let response: IGraphQLResponse<T> = {
		data: jsonParsedObject(expectedData),
	};

	if (expectedErrors) {
		response = {
			...response,
			errors: expectedErrors
		}
	}

	return response;
};