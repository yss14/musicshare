import supertest = require("supertest");
import { HTTPStatusCodes } from "../../types/http-status-codes";
import { jsonParsedObject } from "./json-parsed-object";
import { ApolloServer } from "apollo-server-express";
import * as express from 'express';
import { Scopes, ContextRequest } from "../../types/context";

interface IExecuteGraphQLQueryArgs {
	graphQLServer: ApolloServer;
	query: string;
	expectedHTTPCode?: HTTPStatusCodes;
	scopes?: Scopes;
}

export const executeGraphQLQuery = async ({ graphQLServer: server, query, expectedHTTPCode, scopes }: IExecuteGraphQLQueryArgs) => {
	const expressApp = express();
	expressApp.use((req, _, next) => {
		(<ContextRequest>req).context = {
			userID: null,
			scopes: scopes || [],
		};

		next();
	});
	server.applyMiddleware({ app: expressApp });

	const finalExpectedHTTPCode = expectedHTTPCode || HTTPStatusCodes.OK;

	const httpResponse = await supertest(expressApp)
		.post('/graphql')
		.set('Accept', 'application/json')
		.send({ query })
		.expect((res) => res.status !== finalExpectedHTTPCode ? console.log(res.body) : 0)
		.expect(finalExpectedHTTPCode)
		.expect('Content-Type', /json/);

	return httpResponse;
}

interface IGraphQLResponse<T> {
	data?: T;
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

export const argumentValidationError = (): IGraphQLResponse<never> => ({
	errors: [{ message: 'Argument Validation Error' }]
})