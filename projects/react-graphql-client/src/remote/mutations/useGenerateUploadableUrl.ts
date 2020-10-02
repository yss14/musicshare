import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"
import { MutateFunction } from "react-query"
import { GraphQLClientError } from "../../GraphQLClientError"

export interface IGenerateUploadableUrlData {
	generateUploadableUrl: string
}

export interface IGenerateUploadableUrlVariables {
	fileExtension: string
	fileSize: number
}

export const GENERATE_UPLOADABLE_URL = TransformedGraphQLMutation<
	IGenerateUploadableUrlData,
	IGenerateUploadableUrlVariables
>(gql`
	mutation generateUploadableUrl($fileExtension: String!, $fileSize: Int!) {
		generateUploadableUrl(fileExtension: $fileExtension, fileSize: $fileSize)
	}
`)((data) => data.generateUploadableUrl)

export type GenerateUploadableUrl = MutateFunction<
	string,
	GraphQLClientError<string>,
	IGenerateUploadableUrlVariables,
	unknown
>

export const useGenerateUploadableUrl = (opts?: IGraphQLMutationOpts<typeof GENERATE_UPLOADABLE_URL>) => {
	const mutation = useGraphQLMutation(GENERATE_UPLOADABLE_URL, opts)

	return mutation
}
