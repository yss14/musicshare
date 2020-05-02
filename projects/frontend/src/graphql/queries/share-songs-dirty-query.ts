import { IShareSong, shareSongKeys } from "../types"
import gql from "graphql-tag"
import { useQuery, useApolloClient } from "react-apollo"
import { useCallback, useRef } from "react"
import { GET_SHARE_WITH_SONGS, IGetShareWithSongsData, IGetShareWithSongsVariables } from "./share-songs-query"
import { ITimedstampedResults } from "@musicshare/shared-types"
import useInterval from "@use-it/interval"

export interface IGetShareDirtySongsData {
	share: {
		id: string
		name: string
		songsDirty: ITimedstampedResults<IShareSong>
	}
}

export interface IGetShareDirtySongsVariables {
	shareID: string
	lastTimestamp: Date
}

export const GET_SHARE_DIRTY_SONGS = gql`
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
`

export const useShareDirtySongs = (shareID: string) => {
	const cache = useApolloClient()
	const lastUpdateTimestamp = useRef<Date>(new Date())

	const updateCache = useCallback(
		(data: IGetShareDirtySongsData) => {
			lastUpdateTimestamp.current = data.share.songsDirty.timestamp

			if (data.share.songsDirty.nodes.length === 0) return

			const currentShareSongs = cache.readQuery<IGetShareWithSongsData, IGetShareWithSongsVariables>({
				query: GET_SHARE_WITH_SONGS,
				variables: {
					shareID,
				},
			})

			if (!currentShareSongs) return

			const dirtySongIDs = new Set(data.share.songsDirty.nodes.map((song) => song.id))
			const currentSongIDs = new Set(currentShareSongs.share.songs.map((song) => song.id))
			const newSongs = data.share.songsDirty.nodes.filter((newSong) => !currentSongIDs.has(newSong.id))

			cache.writeQuery<IGetShareWithSongsData, IGetShareWithSongsVariables>({
				query: GET_SHARE_WITH_SONGS,
				variables: {
					shareID,
				},
				data: {
					share: {
						...currentShareSongs.share,
						songs: currentShareSongs.share.songs
							.map((song) =>
								dirtySongIDs.has(song.id)
									? data.share.songsDirty.nodes.find((dirtySong) => dirtySong.id === song.id) || song
									: song,
							)
							.concat(newSongs),
					},
				},
			})
		},
		[cache, shareID],
	)

	const { refetch } = useQuery<IGetShareDirtySongsData, IGetShareDirtySongsVariables>(GET_SHARE_DIRTY_SONGS, {
		fetchPolicy: "network-only",
		skip: true,
	})

	const onInterval = useCallback(() => {
		refetch({
			shareID,
			lastTimestamp: lastUpdateTimestamp.current,
		}).then((result) => {
			// onCompleted is broken for refetch, use this workaround for now
			// https://github.com/apollographql/react-apollo/issues/3709
			if (result.data) {
				updateCache(result.data)
			}
		})
	}, [refetch, shareID, updateCache])

	useInterval(onInterval, 10e3)
}
