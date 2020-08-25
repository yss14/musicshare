import gql from "graphql-tag"
import { Playlist, playlistKeys } from "@musicshare/shared-types"
import { IUseQueryOptions, useGraphQLQuery } from "../../react-query-graphql"
import { useMemoizedResult } from "../../utils/useMemoizedResult"

export interface IGetPlaylistsData {
	share: {
		id: string
		playlists: Playlist[]
	}
}

export interface IGetPlaylistsVariables {
	shareID: string
}

export const GET_SHARE_PLAYLISTS = gql`
	query sharePlaylists($shareID: String!){
		share(shareID: $shareID) {
			id,
			playlists {
				${playlistKeys}
			}
		}
	}
`

export const useSharePlaylists = (
	shareID: string,
	opts?: IUseQueryOptions<IGetPlaylistsData, IGetPlaylistsVariables>,
) => {
	const query = useGraphQLQuery<IGetPlaylistsData, IGetPlaylistsVariables>(GET_SHARE_PLAYLISTS, {
		variables: { shareID },
		...opts,
	})

	return useMemoizedResult(query, (data) => data.share.playlists)
}
