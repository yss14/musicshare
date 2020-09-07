import gql from "graphql-tag"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"
import { MutateFunction } from "react-query"
import { GraphQLClientError } from "../../GraphQLClientError"

interface ISubmitSongFromRemoteFileData {
	submitSongFromRemoteFile: boolean
}

interface ISubmitSongFromRemoteFileInput {
	filename: string
	remoteFileUrl: string
	playlistIDs: string[]
}

interface ISubmitSongFromRemoteFileVariables {
	input: ISubmitSongFromRemoteFileInput
}

export const SUBMIT_SONG_FROM_REMOTE_FILE = TransformedGraphQLMutation<
	ISubmitSongFromRemoteFileData,
	ISubmitSongFromRemoteFileVariables
>(gql`
	mutation SubmitSongFromRemoteFile($input: SubmitSongFromRemoteFileInput!) {
		submitSongFromRemoteFile(input: $input)
	}
`)((data) => data.submitSongFromRemoteFile)

export type SubmitSongFromRemoteFile = MutateFunction<
	boolean,
	GraphQLClientError<boolean>,
	ISubmitSongFromRemoteFileVariables,
	unknown
>

export const useSubmitSongFromRemoteFile = (opts?: IGraphQLMutationOpts<typeof SUBMIT_SONG_FROM_REMOTE_FILE>) => {
	const mutation = useGraphQLMutation(SUBMIT_SONG_FROM_REMOTE_FILE, opts)

	return mutation
}
