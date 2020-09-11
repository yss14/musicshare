import gql from "graphql-tag"
import { ShareSong, shareSongKeys } from "@musicshare/shared-types"
import { TransformedGraphQLMutation, IGraphQLMutationOpts, useGraphQLMutation } from "../../react-query-graphql"

export interface IFindSongNearDuplicatesData {
	viewer: {
		id: string
		findNearDuplicateSongs: ShareSong[]
	}
}

export interface IFindSongNearDuplicatesVariables {
	title: string
	artist: string
	threshold?: number
}

export const GET_SONG_NEAR_DUPLICATES = TransformedGraphQLMutation<
	IFindSongNearDuplicatesData,
	IFindSongNearDuplicatesVariables
>(gql`
	query findNearDuplicateSongs($title: String!, $artist: String!, $threshold: Float) {
		viewer {
			id
			findNearDuplicateSongs(title: $title, artist: $artist, threshold: $threshold) {
				${shareSongKeys}
			}
		}
	}
`)((data) => data.viewer.findNearDuplicateSongs)

export const useSongNearDuplicates = (opts?: IGraphQLMutationOpts<typeof GET_SONG_NEAR_DUPLICATES>) => {
	const query = useGraphQLMutation(GET_SONG_NEAR_DUPLICATES, opts)

	return query
}
