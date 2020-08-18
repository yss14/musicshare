import React, { useContext } from "react"
import { IGraphQLBaseClient } from "GraphQLClient"
import { QueryConfig, useQuery, MutationConfig, useMutation } from "react-query"
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

export const useGraphQLQuery = <TData, TVar extends Record<string, unknown> = {}>(
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
		(_, variables) => graphQLClient.request<TData, TVar>("/graphql", query, variables),
		opts,
	)

	return queryObject
}

export interface IUseMutationOptions<TData, TVar> extends MutationConfig<TData>, GraphQLVariables<TVar> {
	operatioName?: string
}

export const useGraphQLMutation = <TData, TVar extends Record<string, unknown> = {}>(
	mutation: string | DocumentNode,
	{
		variables = {} as TVar,
		operatioName = typeof mutation === "string" ? mutation : getDocKey(mutation),
		...opts
	}: IUseQueryOptions<TData, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const mutationObject = useMutation<TData, unknown, TVar>(
		(variables) => graphQLClient.request("/graphql", mutation, variables),
		opts,
	)

	return mutationObject
}
