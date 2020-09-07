import gql from "graphql-tag"
import { Playlist, playlistKeys } from "@musicshare/shared-types"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetPlaylistsData {
	share: {
		id: string
		playlists: Playlist[]
	}
}

export interface IGetPlaylistsVariables {
	shareID: string
}

export const GET_SHARE_PLAYLISTS = TransformedGraphQLQuery<IGetPlaylistsData, IGetPlaylistsVariables>(gql`
	query sharePlaylists($shareID: String!){
		share(shareID: $shareID) {
			id,
			playlists {
				${playlistKeys}
			}
		}
	}
`)((data) => data.share.playlists)

export const useSharePlaylists = (shareID: string, opts?: IGraphQLQueryOpts<typeof GET_SHARE_PLAYLISTS>) => {
	const query = useGraphQLQuery(GET_SHARE_PLAYLISTS, {
		variables: { shareID },
		...opts,
	})

	return query
}
