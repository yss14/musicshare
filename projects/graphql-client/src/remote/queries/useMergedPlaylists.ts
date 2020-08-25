import gql from "graphql-tag"
import { flatten, uniqBy } from "lodash"
import { playlistKeys, Playlist } from "@musicshare/shared-types"
import { useGraphQLQuery, IUseQueryOptions } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IGetMergedPlaylistData {
	viewer: {
		id: string
		shares: {
			id: string
			playlists: Playlist[]
		}[]
	}
}

export const GET_MERGED_PLAYLISTS = gql`
	query mergedPlaylists {
		viewer {
			id,
			shares {
				id,
				playlists {
					${playlistKeys}
				}
			}
		}
	}
`

export const useMergedPlaylists = (opts?: IUseQueryOptions<IGetMergedPlaylistData, {}>) => {
	const query = useGraphQLQuery<IGetMergedPlaylistData, {}>(GET_MERGED_PLAYLISTS, opts)

	return useMemoizedResult(query, (data) =>
		uniqBy(flatten(data.viewer.shares.map((share) => share.playlists)), (playlist) => playlist.id),
	)
}
