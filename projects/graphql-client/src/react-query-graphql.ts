import React, { useContext } from "react"
import { IGraphQLBaseClient } from "GraphQLClient"
import { QueryConfig, useQuery } from "react-query"
import { DocumentNode } from "graphql"

export const GraphQLClientContext = React.createContext<IGraphQLBaseClient | null>(null)

export const useGraphQLClient = () => {
	const client = useContext(GraphQLClientContext)

	if (!client) {
		throw new Error("useGraphQLClient() hook can only be used with a GraphQLClientContext")
	}

	return client
}

export const getDocKey = (query: DocumentNode): string => {
	return (query.definitions[0] as any).name.value
}

interface GraphQLVariables<TVariables> {
	variables?: TVariables
}

export interface IUseQueryOptions<TData, TVar> extends QueryConfig<TData>, GraphQLVariables<TVar> {
	operatioName?: string
}

export const useGraphQLQuery = <TData, TVar extends Record<string, unknown>>(
	query: string | DocumentNode,
	{
		variables = {} as TVar,
		operatioName = typeof query === "string" ? query : getDocKey(query),
		...opts
	}: IUseQueryOptions<TData, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const cachingKey = [operatioName, variables] as const

	const queryObject = useQuery<TData, unknown, typeof cachingKey>(
		cachingKey,
		async (_, variables) => graphQLClient.request<TData, TVar>("/graphql", query, variables),
		opts,
	)

	return queryObject
}
