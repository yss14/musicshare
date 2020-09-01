import React, { useContext, useMemo } from "react"
import { IGraphQLBaseClient } from "GraphQLClient"
import { QueryConfig, usePaginatedQuery, MutationConfig, useMutation, QueryCache, queryCache } from "react-query"
import { DocumentNode } from "graphql"
import { Updater } from "react-query/types/core/utils"

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

export interface ITypedGraphQLQuery<TData, TDataTransformed, TVar> {
	query: DocumentNode
	dataTransformation: (data: TData) => TDataTransformed
	varType: TVar
}

// TODO add overload for constructor function without data transformation function
export const TransformedGraphQLQuery = <TData, TVar = {}>(query: DocumentNode) => <TDataTransformed>(
	dataTransformation: (data: TData) => TDataTransformed,
): ITypedGraphQLQuery<TData, TDataTransformed, TVar> => ({
	query,
	dataTransformation,
	varType: ({} as unknown) as TVar,
})

export type IGraphQLQueryOpts<T> = T extends ITypedGraphQLQuery<infer TData, infer TDataTransformed, infer TVar>
	? IUseQueryOptions<TDataTransformed, TVar>
	: never

interface GraphQLVariables<TVariables> {
	variables?: TVariables
}

export interface IUseQueryOptions<TData, TVar = {}> extends QueryConfig<TData>, GraphQLVariables<TVar> {
	operatioName?: string
}

export const useGraphQLQuery = <TData, TDataTransformed, TVar extends {} = {}>(
	{ query, dataTransformation }: ITypedGraphQLQuery<TData, TDataTransformed, TVar>,
	{
		variables = {} as TVar,
		operatioName = getQueryKey(query),
		...opts
	}: IUseQueryOptions<TDataTransformed, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const cachingKey = [operatioName, variables] as const

	const queryObject = usePaginatedQuery<TDataTransformed, unknown, typeof cachingKey>(
		cachingKey,
		(_, variables) => graphQLClient.request<TData, TVar>("/graphql", query, variables).then(dataTransformation),
		opts,
	)

	return useMemo(
		() => ({
			...queryObject,
			data: queryObject.resolvedData,
		}),
		[queryObject],
	)
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

export interface IQueryCacheQuery<TData, TDataTransformed, TVar> {
	query: ITypedGraphQLQuery<TData, TDataTransformed, TVar>
	variables: TVar
}

export interface QueryPredicateOptions {
	exact?: boolean
}

export interface ITypedQueryCache extends QueryCache {
	getTypedQueryData: <TData, TDataTransformed, TVar>(
		query: IQueryCacheQuery<TData, TDataTransformed, TVar>,
	) => TDataTransformed | undefined
	setTypedQueryData: <TData, TDataTransformed, TVar>(
		query: IQueryCacheQuery<TData, TDataTransformed, TVar>,
		update: TDataTransformed | Updater<TDataTransformed | undefined, TDataTransformed>,
	) => void
	removeTypedQuery: <TData, TDataTransformed, TVar>(
		query: IQueryCacheQuery<TData, TDataTransformed, TVar>,
		options?: QueryPredicateOptions,
	) => void
	// TODO add getQuery()
}

;(queryCache as ITypedQueryCache).getTypedQueryData = function <TData, TDataTransformed, TVar>({
	query: { query },
	variables = {} as TVar,
}: IQueryCacheQuery<TData, TDataTransformed, TVar>): TDataTransformed | undefined {
	const queryKey = variables ? [getQueryKey(query), variables] : getQueryKey(query)

	return queryCache.getQueryData(queryKey)
}
;(queryCache as ITypedQueryCache).setTypedQueryData = function <TData, TDataTransformed, TVar>(
	{ query: { query }, variables }: IQueryCacheQuery<TData, TDataTransformed, TVar>,
	update: TDataTransformed | Updater<TDataTransformed | undefined, TDataTransformed>,
) {
	const queryKey = variables ? [getQueryKey(query), variables] : getQueryKey(query)

	if (typeof update === "function") {
		queryCache.setQueryData<TDataTransformed>(queryKey, update)
	} else {
		queryCache.setQueryData<TDataTransformed>(queryKey, () => update)
	}
}
;(queryCache as ITypedQueryCache).removeTypedQuery = function <TData, TDataTransformed, TVar>(
	{ query: { query }, variables = {} as TVar }: IQueryCacheQuery<TData, TDataTransformed, TVar>,
	options?: QueryPredicateOptions,
) {
	const queryKey = variables ? [getQueryKey(query), variables] : getQueryKey(query)

	queryCache.removeQueries(queryKey, options)
}

export const typedQueryCache = queryCache as ITypedQueryCache
