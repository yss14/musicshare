import axios, { AxiosRequestConfig, AxiosError } from "axios"
import { DocumentNode } from "graphql"
import { print } from "graphql/language/printer"
import { getQueryKey } from "./utils/getQueryKey"
import { GraphQLClientError, IGraphQLResponse } from "./GraphQLClientError"

const isAxiosResponse = <T>(obj: any): obj is AxiosError<T> =>
	typeof obj === "object" && typeof obj.request === "object" && typeof obj.request === "object"

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

		const operationName = getQueryKey(query)

		try {
			const response = await client.post<IGraphQLResponse<TData>>(`${url}?operation=${operationName}`, body)

			if (response.status >= 200 && response.status <= 204 && response.data.data && !response.data.errors) {
				return response.data.data
			} else {
				throw new GraphQLClientError({ ...response.data }, { query: printedQuery, variables })
			}
		} catch (err) {
			if (err instanceof GraphQLClientError) {
				throw err
			} else if (isAxiosResponse<IGraphQLResponse<TData>>(err)) {
				throw new GraphQLClientError({ ...err.response, status: 400 }, { query: printedQuery, variables })
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
