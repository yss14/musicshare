import { IPlaylist } from "../types"
import gql from "graphql-tag"
import { playlistKeys } from "./playlists-query"
import { useQuery } from "react-apollo"
import { flatten, uniqBy } from "lodash"

export interface IGetMergedPlaylistData {
	viewer: {
		id: string
		__typename: "User"
		shares: {
			id: string
			__typename: "Share"
			playlists: IPlaylist[]
		}[]
	}
}

export const GET_MERGED_PLAYLISTS = gql`
	query getMergedPlaylists{
		viewer {
			id,
			shares{
				id,
				playlists{
					${playlistKeys}
				}
			}
		}
	}
`

export const useMergedPlaylists = () => {
	const { data, ...rest } = useQuery<IGetMergedPlaylistData, {}>(GET_MERGED_PLAYLISTS)

	const mergedData = data
		? uniqBy(flatten(data.viewer.shares.map((share) => share.playlists)), (playlist) => playlist.id)
		: null

	return { data: mergedData, ...rest }
}
