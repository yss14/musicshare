import { ITimedstampedResults, ShareSong, shareSongKeys } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { TransformedGraphQLQuery, useGraphQLQuery, typedQueryClient } from "../../react-query-graphql"
import { useRef } from "react"
import { updateShareSongs } from "./useDirtyShareSongs"
import { GET_MERGED_SONGS } from "./useMergedSongs"
import { getSongsDiff } from "../../utils/getSongsDiff"
import { flattenDeep } from "lodash"

export interface IGetDirtyMergedViewSongsData {
	viewer: {
		id: string
		shares: {
			id: string
			name: string
			songsDirty: ITimedstampedResults<ShareSong>
		}[]
	}
}

export interface IGetDirtyMergedViewSongsVariables {
	lastTimestamp: Date
}

export const GET_DIRTY_MERGED_VIEW_SONGS = TransformedGraphQLQuery<
	IGetDirtyMergedViewSongsData,
	IGetDirtyMergedViewSongsVariables
>(gql`
	query dirtyMergedViewSongs($lastTimestamp: DateTime!) {
		viewer{
			id
			shares{
				id
				name
				songsDirty(lastTimestamp: $lastTimestamp){
					nodes{
						${shareSongKeys}
					}
					timestamp
				}
			}
		}
	}
`)((data) => data.viewer.shares)

export const useDirtyMergedViewSongs = () => {
	const lastUpdateTimestamp = useRef<Date>(new Date())

	const query = useGraphQLQuery(GET_DIRTY_MERGED_VIEW_SONGS, {
		variables: { lastTimestamp: lastUpdateTimestamp.current },
		refetchInterval: 10e3,
		cacheTime: 9e3,
		onSuccess: (data) => {
			if (data.length === 0) return

			try {
				for (const dirtyShare of data) {
					if (dirtyShare.songsDirty.nodes.length > 0) {
						updateShareSongs(dirtyShare.id, dirtyShare.songsDirty.nodes)
					}
				}
			} catch (err) {
				console.error(err)
			}

			const currentMergedSongs = typedQueryClient.getTypedQueryData({
				query: GET_MERGED_SONGS,
				variables: {},
			})

			const dirtySongs = flattenDeep(data.map((share) => share.songsDirty.nodes))

			if (!currentMergedSongs || dirtySongs.length === 0) return

			lastUpdateTimestamp.current = data[0].songsDirty.timestamp

			const { dirtySongIDs, newSongs } = getSongsDiff(currentMergedSongs, dirtySongs)

			typedQueryClient.setTypedQueryData(
				{
					query: GET_MERGED_SONGS,
					variables: {},
				},
				currentMergedSongs
					.map((song) =>
						dirtySongIDs.has(song.id)
							? dirtySongs.find((dirtySong) => dirtySong.id === song.id) || song
							: song,
					)
					.concat(newSongs),
			)
		},
	})

	return query
}
