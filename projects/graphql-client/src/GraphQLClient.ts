import axios, { AxiosRequestConfig } from "axios"
import { DocumentNode } from "graphql"
import { print } from "graphql/language/printer"
import { GraphQLClientError } from "./GraphQLClientError"

export type IGraphQLBaseClient = ReturnType<typeof GraphQLClient>

export const GraphQLClient = (opts?: AxiosRequestConfig) => {
	const client = axios.create({
		...opts,
		headers: {
			"Content-Type": "application/json",
			...opts?.headers,
		},
	})

	const request = async <TData, TVar>(
		url: string,
		query: string | DocumentNode,
		variables?: TVar,
	): Promise<TData> => {
		const printedQuery = typeof query === "string" ? query : print(query)
		const body = JSON.stringify({
			query: printedQuery,
			variables: variables ? variables : undefined,
		})

		try {
			const response = await client.post<TData>(url, body)

			return response.data
		} catch (err) {
			if (err instanceof GraphQLClientError) {
				throw err
			}

			throw new GraphQLClientError({ ...err, status: 400 }, { query: printedQuery, variables })
		}
	}

	return {
		request,
		useRequestMiddleware: client.interceptors.request.use.bind(client.interceptors.request),
		useResponseMiddleware: client.interceptors.response.use.bind(client.interceptors.response),
	}
}
