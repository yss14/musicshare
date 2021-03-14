import { ITimedstampedResults, ShareSong, shareSongKeys } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useRef } from "react"
import {
	useGraphQLQuery,
	TransformedGraphQLQuery,
	typedQueryClient,
	IGraphQLQueryOpts,
} from "../../react-query-graphql"
import { GET_SHARE_SONGS } from "./useShareSongs"
import { getSongsDiff } from "../../utils/getSongsDiff"

export interface IGetDirtyShareSongsData {
	share: {
		id: string
		songsDirty: ITimedstampedResults<ShareSong>
	}
}

export interface IGetDirtyShareSongsVariables {
	shareID: string
	lastTimestamp: Date
}

export const GET_DIRTY_SHARE_SONGS = TransformedGraphQLQuery<IGetDirtyShareSongsData, IGetDirtyShareSongsVariables>(gql`
  	query dirtyShareSongs($shareID: String!, $lastTimestamp: DateTime!) {
    	share(shareID: $shareID) {
      		id
      		name
      		songsDirty(lastTimestamp: $lastTimestamp) {
        		nodes{
					${shareSongKeys}
				}
				timestamp
      		}
    	}
  	}
`)((data) => data.share.songsDirty)

export const useDirtyShareSongs = (shareID: string, opts?: IGraphQLQueryOpts<typeof GET_DIRTY_SHARE_SONGS>) => {
	const lastUpdateTimestamp = useRef<Date>(new Date())

	const query = useGraphQLQuery(GET_DIRTY_SHARE_SONGS, {
		variables: { shareID, lastTimestamp: lastUpdateTimestamp.current },
		refetchInterval: 10e3,
		cacheTime: 9e3,
		onSuccess: async (data) => {
			if (data.nodes.length === 0) return

			lastUpdateTimestamp.current = data.timestamp

			updateShareSongs(shareID, data.nodes)
		},
		...opts,
	})

	return query
}

export const updateShareSongs = (shareID: string, dirtySongs: ShareSong[]) => {
	const currentShareSongs = typedQueryClient.getTypedQueryData({
		query: GET_SHARE_SONGS,
		variables: { shareID },
	})

	if (!currentShareSongs) return

	const { dirtySongIDs, newSongs } = getSongsDiff(currentShareSongs, dirtySongs)

	typedQueryClient.setTypedQueryData(
		{
			query: GET_SHARE_SONGS,
			variables: { shareID },
		},
		currentShareSongs
			.map((song) =>
				dirtySongIDs.has(song.id) ? dirtySongs.find((dirtySong) => dirtySong.id === song.id) || song : song,
			)
			.concat(newSongs),
	)
}
