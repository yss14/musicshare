import gql from "graphql-tag"
import { ShareSong, shareSongKeys } from "@musicshare/shared-types"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

interface IFindSongFileDuplicatesData {
	viewer: {
		id: string
		findSongFileDuplicates: ShareSong[]
	}
}

interface IFindSongFileDuplicatesVariables {
	hash: string
}

const GET_SONG_FILE_DUPLICATES = TransformedGraphQLMutation<
	IFindSongFileDuplicatesData,
	IFindSongFileDuplicatesVariables
>(gql`
	query FindSongFileDuplicates($hash: String!) {
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
