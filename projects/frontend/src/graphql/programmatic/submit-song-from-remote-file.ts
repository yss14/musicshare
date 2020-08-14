import gql from "graphql-tag"
import { ApolloClient } from "@apollo/client"

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

export const SUBMIT_SONG_FROM_REMOTE_FILE = gql`
	mutation SubmitSongFromRemoteFile($input: SubmitSongFromRemoteFileInput!) {
		submitSongFromRemoteFile(input: $input)
	}
`

export type SubmitSongFromRemoteFile = (input: ISubmitSongFromRemoteFileInput) => Promise<void>

export const makeSubmitSongFromRemoteFile = (client: ApolloClient<unknown>): SubmitSongFromRemoteFile => async (
	input,
) => {
	const response = await client.mutate<ISubmitSongFromRemoteFileData, ISubmitSongFromRemoteFileVariables>({
		mutation: SUBMIT_SONG_FROM_REMOTE_FILE,
		variables: {
			input,
		},
	})

	if (!response.data || response.data.submitSongFromRemoteFile === false) {
		throw new Error("Song submission failed")
	}
}
