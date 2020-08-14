import gql from "graphql-tag"
import { ApolloClient } from "@apollo/client"

interface IGenerateUploadableUrlData {
	generateUploadableUrl: string
}

interface IgenerateUploadableUrlVariables {
	fileExtension: string
}

const GENERATE_UPLOADABLE_URL = gql`
	mutation GenerateUploadableUrl($fileExtension: String!) {
		generateUploadableUrl(fileExtension: $fileExtension)
	}
`

export type GenerateUploadableUrl = (fileExtension: string) => Promise<string>

export const makeGenerateUploadableUrl = (client: ApolloClient<unknown>) => async (fileExtension: string) => {
	const response = await client.mutate<IGenerateUploadableUrlData, IgenerateUploadableUrlVariables>({
		mutation: GENERATE_UPLOADABLE_URL,
		variables: { fileExtension },
	})

	if (response.data) {
		return response.data.generateUploadableUrl
	} else {
		throw new Error("Cannot generate uploadable url")
	}
}
