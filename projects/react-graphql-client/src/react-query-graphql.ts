import React, { useContext } from "react"
import { IGraphQLBaseClient } from "GraphQLClient"
import { UseQueryOptions, useQuery, UseMutationOptions, useMutation, QueryClient } from "react-query"
import { DocumentNode } from "graphql"
import { Updater } from "react-query/types/core/utils"
import { GraphQLClientError } from "./GraphQLClientError"
import { queryClient } from "queryClient"

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

export interface ITypedGraphQLOperation<TData, TDataTransformed, TVar> {
	query: DocumentNode
	dataTransformation: (data: TData) => TDataTransformed
	varType: TVar
}

export const TransformedGraphQLQuery = <TData, TVar = {}>(query: DocumentNode) => <TDataTransformed>(
	dataTransformation: (data: TData) => TDataTransformed,
): ITypedGraphQLOperation<TData, TDataTransformed, TVar> => ({
	query,
	dataTransformation,
	varType: ({} as unknown) as TVar,
})

// eslint-disable-next-line
export type IGraphQLQueryOpts<T> = T extends ITypedGraphQLOperation<infer TData, infer TDataTransformed, infer TVar>
	? IUseQueryOptions<TDataTransformed, TVar>
	: never

export const TransformedGraphQLMutation = TransformedGraphQLQuery

// eslint-disable-next-line
export type IGraphQLMutationOpts<T> = T extends ITypedGraphQLOperation<infer TData, infer TDataTransformed, infer TVar>
	? IUseMutationOptions<TDataTransformed, TVar>
	: never

interface GraphQLVariables<TVariables> {
	variables?: TVariables
}

export interface IBaseResolverArgs<TVar> {
	variables: TVar
	client: IGraphQLBaseClient
}

export interface IQueryResolverArgs<TVar> extends IBaseResolverArgs<TVar> {
	query: DocumentNode
}

export interface IUseQueryOptions<TData, TVar = {}> extends UseQueryOptions<TData>, GraphQLVariables<TVar> {
	operatioName?: string
	resolver?: (args: IQueryResolverArgs<TVar>) => TData | Promise<TData>
}

export const useGraphQLQuery = <TData, TDataTransformed, TVar extends {} = {}>(
	{ query, dataTransformation }: ITypedGraphQLOperation<TData, TDataTransformed, TVar>,
	{
		variables = {} as TVar,
		operatioName = getQueryKey(query),
		resolver,
		...opts
	}: IUseQueryOptions<TDataTransformed, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const cachingKey = [operatioName, variables]

	const queryObject = useQuery<TDataTransformed, unknown, TDataTransformed>(
		cachingKey,
		async () => {
			if (resolver) {
				return resolver({ query, client: graphQLClient, variables })
			} else {
				return graphQLClient.request<TData, TVar>("/graphql", query, variables).then(dataTransformation)
			}
		},
		opts,
	)

	return queryObject
}

export interface IMutationResolverArgs<TVar> extends IBaseResolverArgs<TVar> {
	mutation: DocumentNode
}

export interface IUseMutationOptions<TData, TVar>
	extends UseMutationOptions<TData, GraphQLClientError<TData>, TVar>,
		GraphQLVariables<TVar> {
	resolver?: (args: IMutationResolverArgs<TVar>) => TData | Promise<TData>
}

export const useGraphQLMutation = <TData, TDataTransformed, TVar extends {} = {}>(
	{ query: mutation, dataTransformation }: ITypedGraphQLOperation<TData, TDataTransformed, TVar>,
	{
		// eslint-disable-next-line
		variables = {} as TVar,
		resolver,
		...opts
	}: IUseMutationOptions<TDataTransformed, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const mutationObject = useMutation<TDataTransformed, GraphQLClientError<TDataTransformed>, TVar>(
		async (variables) => {
			if (resolver) {
				return resolver({ mutation, client: graphQLClient, variables })
			} else {
				return graphQLClient.request<TData, TVar>("/graphql", mutation, variables).then(dataTransformation)
			}
		},
		opts,
	)

	return mutationObject
}

export interface IQueryCacheQuery<TData, TDataTransformed, TVar> {
	query: ITypedGraphQLOperation<TData, TDataTransformed, TVar>
	variables?: TVar
}

export interface QueryPredicateOptions {
	exact?: boolean
}

export interface InvalidateQueriesOptions extends QueryPredicateOptions {
	refetchActive?: boolean
	refetchInactive?: boolean
	throwOnError?: boolean
}

export interface ITypedQueryClient extends QueryClient {
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
	invalidateTypedQuery: <TData, TDataTransformed, TVar>(
		query: IQueryCacheQuery<TData, TDataTransformed, TVar>,
		options?: InvalidateQueriesOptions,
	) => Promise<void>
}

export const typedQueryClient = queryClient as ITypedQueryClient

typedQueryClient.getTypedQueryData = function <TData, TDataTransformed, TVar>({
	query: { query },
	variables = {} as TVar,
}: IQueryCacheQuery<TData, TDataTransformed, TVar>): TDataTransformed | undefined {
	const queryKey = [getQueryKey(query), variables || {}]

	return queryClient.getQueryData<TDataTransformed>(queryKey)
}

typedQueryClient.setTypedQueryData = function <TData, TDataTransformed, TVar>(
	{ query: { query }, variables }: IQueryCacheQuery<TData, TDataTransformed, TVar>,
	update: TDataTransformed | Updater<TDataTransformed | undefined, TDataTransformed>,
) {
	const queryKey = [getQueryKey(query), variables || {}]

	if (typeof update === "function") {
		queryClient.setQueryData<TDataTransformed>(queryKey, update)
	} else {
		queryClient.setQueryData<TDataTransformed>(queryKey, () => update)
	}
}

typedQueryClient.removeTypedQuery = async function <TData, TDataTransformed, TVar>(
	{ query: { query }, variables = {} as TVar }: IQueryCacheQuery<TData, TDataTransformed, TVar>,
	options?: QueryPredicateOptions,
) {
	const queryKey = [getQueryKey(query), variables || {}]

	queryClient.removeQueries(queryKey, options)
}

typedQueryClient.invalidateTypedQuery = async function <TData, TDataTransformed, TVar>(
	{ query: { query }, variables = {} as TVar }: IQueryCacheQuery<TData, TDataTransformed, TVar>,
	options?: InvalidateQueriesOptions,
) {
	const queryKey = [getQueryKey(query), variables || {}]

	await queryClient.invalidateQueries(queryKey, options)
}
