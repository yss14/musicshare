import gql from "graphql-tag"
import { flatten, uniqBy } from "lodash"
import { ShareSong, shareSongKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IGetMergedSongsData {
	viewer: {
		id: string
		shares: {
			id: string
			songs: ShareSong[]
		}[]
	}
}

export const GET_MERGED_SONGS = gql`
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
`

export const useMergedSongs = (opts?: IUseQueryOptions<IGetMergedSongsData, {}>) => {
	const query = useGraphQLQuery<IGetMergedSongsData, {}>(GET_MERGED_SONGS, opts)

	return useMemoizedResult(query, (data) =>
		uniqBy(flatten(data.viewer.shares.map((share) => share.songs)), (song) => song.id),
	)
}
