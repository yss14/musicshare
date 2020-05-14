import { shareSongKeys } from "../types"
import gql from "graphql-tag"
import { useQuery } from "react-apollo"
import { flatten, uniqBy } from "lodash"
import { IShareSong } from "@musicshare/shared-types"

export interface IGetMergedSongsData {
	viewer: {
		id: string
		__typename: "User"
		shares: {
			id: string
			__typename: "Share"
			songs: IShareSong[]
		}[]
	}
}

export const GET_MERGED_SONGS = gql`
	query getMergedSongs{
		viewer{
			id
			shares{
				id
				songs{
					${shareSongKeys}
				}
			}
		}
	}
`

export const useMergedSongs = () => {
	const { data, ...rest } = useQuery<IGetMergedSongsData, {}>(GET_MERGED_SONGS)

	const mergedData = data
		? uniqBy(flatten(data.viewer.shares.map((share) => share.songs)), (song) => song.id)
		: undefined

	return { data: mergedData, ...rest }
}
