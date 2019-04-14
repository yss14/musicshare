import { GraphQLServer } from "graphql-yoga";
import supertest = require("supertest");
import { HTTPStatusCodes } from "../../types/http-status-codes";
import { jsonParsedObject } from "./json-parsed-object";

export const executeGraphQLQuery = async (server: GraphQLServer, query: string, expectedHTTPCode: HTTPStatusCodes = 200) => {
	const httpResponse = await supertest(server.express)
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