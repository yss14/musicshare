import gql from "graphql-tag"
import { flatten, uniqBy } from "lodash"
import { ShareSong, shareSongKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetMergedSongsData {
	viewer: {
		id: string
		shares: {
			id: string
			songs: ShareSong[]
		}[]
	}
}

export const GET_MERGED_SONGS = TransformedGraphQLQuery<IGetMergedSongsData>(gql`
	query mergedSongs {
		viewer {
			id
			shares {
				id
				songs {
					${shareSongKeys}
				}
			}
		}
	}
`)((data) => uniqBy(flatten(data.viewer.shares.map((share) => share.songs)), (song) => song.id))

export const useMergedSongs = (opts?: IGraphQLQueryOpts<typeof GET_MERGED_SONGS>) => {
	const query = useGraphQLQuery(GET_MERGED_SONGS, opts)

	return query
}
