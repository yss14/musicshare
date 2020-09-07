import gql from "graphql-tag"
import { flatten, uniqBy } from "lodash"
import { playlistKeys, Playlist } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetMergedPlaylistData {
	viewer: {
		id: string
		shares: {
			id: string
			playlists: Playlist[]
		}[]
	}
}

export const GET_MERGED_PLAYLISTS = TransformedGraphQLQuery<IGetMergedPlaylistData>(gql`
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
`)((data) => uniqBy(flatten(data.viewer.shares.map((share) => share.playlists)), (playlist) => playlist.id))

export const useMergedPlaylists = (opts?: IGraphQLQueryOpts<typeof GET_MERGED_PLAYLISTS>) => {
	const query = useGraphQLQuery(GET_MERGED_PLAYLISTS, opts)

	return query
}
