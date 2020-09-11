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
	threshould?: number
}

export const GET_SONG_NEAR_DUPLICATES = TransformedGraphQLMutation<
	IFindSongNearDuplicatesData,
	IFindSongNearDuplicatesVariables
>(gql`
	query findNearDuplicateSongs($title: String!, $artist: String!) {
		viewer {
			id
			findNearDuplicateSongs(title: $title, artist: $artist) {
				${shareSongKeys}
			}
		}
	}
`)((data) => data.viewer.findNearDuplicateSongs)

export const useSongNearDuplicates = (opts?: IGraphQLMutationOpts<typeof GET_SONG_NEAR_DUPLICATES>) => {
	const query = useGraphQLMutation(GET_SONG_NEAR_DUPLICATES, opts)

	return query
}
