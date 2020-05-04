import supertest from "supertest"
import { HTTPStatusCodes } from "../../types/http-status-codes"
import { jsonParsedObject } from "./json-parsed-object"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import { Scopes, ContextRequest } from "../../types/context"
import { makeAllScopes } from "./setup-test-env"
import { testData } from "../../database/seed"
import { Share } from "../../models/ShareModel"

interface IExecuteGraphQLQueryArgs {
	graphQLServer: ApolloServer
	query: string
	expectedHTTPCode?: HTTPStatusCodes
	scopes?: Scopes
	userID?: string
	library?: Share
}

export const executeGraphQLQuery = async ({
	graphQLServer: server,
	query,
	expectedHTTPCode,
	scopes,
	userID,
	library,
}: IExecuteGraphQLQueryArgs) => {
	const expressApp = express()
	expressApp.use((req, _, next) => {
		;(<ContextRequest>req).context = {
			userID: userID || testData.users.user1.user_id.toString(),
			scopes: scopes || makeAllScopes(),
			library: library || Share.fromDBResult(testData.shares.library_user1),
		}

		next()
	})
	server.applyMiddleware({ app: expressApp })

	const finalExpectedHTTPCode = expectedHTTPCode || HTTPStatusCodes.OK

	const httpResponse = await supertest(expressApp)
		.post("/graphql")
		.set("Accept", "application/json")
		.send({ query })
		.expect((res) => (res.status !== finalExpectedHTTPCode ? console.log(res.body) : 0))
		.expect(finalExpectedHTTPCode)
		.expect("Content-Type", /json/)

	return httpResponse
}

interface IGraphQLResponse<T> {
	data?: T
	errors?: any[]
}

export const makeGraphQLResponse = <T>(expectedData: T, expectedErrors?: any[]) => {
	let response: IGraphQLResponse<T> = {
		data: jsonParsedObject(expectedData),
	}

	if (expectedErrors) {
		response = {
			...response,
			errors: expectedErrors,
		}
	}

	return response
}

export const argumentValidationError = (message: string = "Argument Validation Error"): IGraphQLResponse<never> => ({
	errors: [{ message }],
})

export const insufficientPermissionsError = (): IGraphQLResponse<never> => ({
	errors: [{ message: "User has insufficient permissions to perform this action!" }],
})
