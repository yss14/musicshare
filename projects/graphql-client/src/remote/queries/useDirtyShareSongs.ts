import { ITimedstampedResults, ShareSong, shareSongKeys } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useRef } from "react"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

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
  	query ShareSongsDirty($shareID: String!, $lastTimestamp: DateTime!) {
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
		onSuccess: async (data) => {
			lastUpdateTimestamp.current = data.timestamp

			if (data.nodes.length === 0) return

			/*const currentShareSongs = queryCache.getQueryData<IGetShareSongsData>([
				getQueryKey(GET_SHARE_SONGS),
				{ shareID },
			])

			if (!currentShareSongs) return

			const { dirtySongIDs, newSongs } = getSongsDiff(currentShareSongs.share.songs, data.share.songsDirty.nodes)*/
		},
		...opts,
	})

	return query
}
