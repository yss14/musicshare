import { GraphQLError } from "graphql/error/GraphQLError"
import { AxiosError } from "axios"

export type Variables = { [key: string]: any }

export interface IGraphQLResponse<TData> {
	data?: TData
	errors?: GraphQLError[]
	extensions?: any
	status: number
	[key: string]: any
}

export interface GraphQLRequestContext {
	query: string
	variables?: Variables
}

export class GraphQLClientError<TData> extends Error {
	response: IGraphQLResponse<TData>
	request: GraphQLRequestContext

	constructor(response: IGraphQLResponse<TData>, request: GraphQLRequestContext) {
		const message = GraphQLClientError.extractMessage(response)
		super(message)
		this.response = response
		this.request = request

		// this is needed as Safari doesn't support .captureStackTrace
		/* tslint:disable-next-line */
		if (typeof (Error as any).captureStackTrace === "function") {
			;(Error as any).captureStackTrace(this, GraphQLClientError)
		}
	}

	private static extractMessage<TData>(response: IGraphQLResponse<TData>): string {
		try {
			return response.errors![0].message
		} catch (e) {
			return `GraphQL Error (Code: ${response.status})`
		}
	}
}

export const isAxiosError = (err: any): err is AxiosError => err.isAxiosError === true
