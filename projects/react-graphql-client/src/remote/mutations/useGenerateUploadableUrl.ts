import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"
import { MutateFunction } from "react-query"
import { GraphQLClientError } from "../../GraphQLClientError"

export interface IGenerateUploadableUrlData {
	generateUploadableUrl: string
}

export interface IGenerateUploadableUrlVariables {
	fileExtension: string
}

export const GENERATE_UPLOADABLE_URL = TransformedGraphQLMutation<
	IGenerateUploadableUrlData,
	IGenerateUploadableUrlVariables
>(gql`
	mutation generateUploadableUrl($fileExtension: String!) {
		generateUploadableUrl(fileExtension: $fileExtension)
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
