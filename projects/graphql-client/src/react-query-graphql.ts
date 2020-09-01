import React, { useContext } from "react"
import { IGraphQLBaseClient } from "GraphQLClient"
import { QueryConfig, usePaginatedQuery, MutationConfig, useMutation, QueryCache, queryCache, Query } from "react-query"
import { DocumentNode } from "graphql"

export const GraphQLClientContext = React.createContext<IGraphQLBaseClient | null>(null)

export const useGraphQLClient = () => {
	const client = useContext(GraphQLClientContext)

	if (!client) {
		throw new Error("useGraphQLClient() hook can only be used with a GraphQLClientContext")
	}

	return client
}

export const getQueryKey = (query: DocumentNode): string => {
	return (query.definitions[0] as any).name.value
}

interface GraphQLVariables<TVariables> {
	variables?: TVariables
}

export interface IUseQueryOptions<TData, TDataTransformed, TVar = {}>
	extends QueryConfig<TDataTransformed>,
		GraphQLVariables<TVar> {
	operatioName?: string
	transformFn?: (data: TData) => TDataTransformed
}

export const useGraphQLQuery = <TData, TDataTransformed, TVar extends {} = {}>(
	query: string | DocumentNode,
	{
		variables = {} as TVar,
		operatioName = typeof query === "string" ? query : getQueryKey(query),
		transformFn = (data) => (data as unknown) as TDataTransformed,
		...opts
	}: IUseQueryOptions<TData, TDataTransformed, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const cachingKey = [operatioName, variables] as const

	const queryObject = usePaginatedQuery<TDataTransformed, unknown, typeof cachingKey>(
		cachingKey,
		(_, variables) => graphQLClient.request<TData, TVar>("/graphql", query, variables).then(transformFn),
		opts,
	)

	return queryObject
}

export interface IUseMutationOptions<TData, TVar> extends MutationConfig<TData>, GraphQLVariables<TVar> {
	operatioName?: string
}

export const useGraphQLMutation = <TData, TVar extends {} = {}>(
	mutation: string | DocumentNode,
	{
		variables = {} as TVar,
		operatioName = typeof mutation === "string" ? mutation : getQueryKey(mutation),
		...opts
	}: IUseMutationOptions<TData, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const mutationObject = useMutation<TData, unknown, TVar>(
		(variables) => graphQLClient.request("/graphql", mutation, variables),
		opts,
	)

	return mutationObject
}

export interface ITypedGraphQLQuery<TData, TDataTransformed, TVar> {
	query: DocumentNode
	dataTransformation: (data: TData) => TDataTransformed
	varType: TVar
}

// TODO add overload for constructor function without data transformation function
export const TransformedGraphQLQuery = <TData, TVar>(query: DocumentNode) => <TDataTransformed>(
	dataTransformation: (data: TData) => TDataTransformed,
): ITypedGraphQLQuery<TData, TDataTransformed, TVar> => ({
	query,
	dataTransformation,
	varType: ({} as unknown) as TVar,
})

export const useTypedGraphQLQuery = <TData, TDataTransformed, TVar extends {} = {}>(
	{ query, dataTransformation }: ITypedGraphQLQuery<TData, TDataTransformed, TVar>,
	{
		variables = {} as TVar,
		operatioName = getQueryKey(query),
		...opts
	}: IUseQueryOptions<TData, TDataTransformed, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const cachingKey = [operatioName, variables] as const

	const queryObject = usePaginatedQuery<TDataTransformed, unknown, typeof cachingKey>(
		cachingKey,
		(_, variables) => graphQLClient.request<TData, TVar>("/graphql", query, variables).then(dataTransformation),
		opts,
	)

	return queryObject
}

export interface ITypedQueryCache extends QueryCache {
	getQueryData: <TData, TDataTransformed, TVar>(
		this: QueryCache,
		{ query }: ITypedGraphQLQuery<TData, TDataTransformed, TVar>,
	) => TDataTransformed | undefined
	// TODO add getQuery() and setQueryData()
}

;(queryCache as ITypedQueryCache).getQueryData = function <TData, TDataTransformed, TVar>(
	this: QueryCache,
	{ query }: ITypedGraphQLQuery<TData, TDataTransformed, TVar>,
): TDataTransformed | undefined {
	return this.getQueryData(getQueryKey(query))
}

export const typedQueryCache = queryCache as ITypedQueryCache
