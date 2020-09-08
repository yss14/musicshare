import gql from "graphql-tag"
import { ShareSong, shareSongKeys } from "@musicshare/shared-types"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

export interface IFindSongFileDuplicatesData {
	viewer: {
		id: string
		findSongFileDuplicates: ShareSong[]
	}
}

export interface IFindSongFileDuplicatesVariables {
	hash: string
}

export const GET_SONG_FILE_DUPLICATES = TransformedGraphQLMutation<
	IFindSongFileDuplicatesData,
	IFindSongFileDuplicatesVariables
>(gql`
	query findSongFileDuplicates($hash: String!) {
		viewer {
			id
			findSongFileDuplicates(hash: $hash) {
				${shareSongKeys}
			}
		}
	}
`)((data) => data.viewer.findSongFileDuplicates)

export const useSongFileDuplicates = (opts?: IGraphQLMutationOpts<typeof GET_SONG_FILE_DUPLICATES>) => {
	const query = useGraphQLMutation(GET_SONG_FILE_DUPLICATES, opts)

	return query
}
