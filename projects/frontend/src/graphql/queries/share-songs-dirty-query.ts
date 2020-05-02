import { IShareSong, shareSongKeys } from "../types"
import gql from "graphql-tag"
import { useQuery, useApolloClient } from "react-apollo"
import { useCallback, useRef } from "react"
import { GET_SHARE_WITH_SONGS, IGetShareWithSongsData, IGetShareWithSongsVariables } from "./share-songs-query"
import { ITimedstampedResults } from "@musicshare/shared-types"
import useInterval from "@use-it/interval"
import ApolloClient from "apollo-client"
import { IGetMergedSongsData, GET_MERGED_SONGS } from "./merged-songs-query"

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

export interface IGetMergedViewDirtySongsData {
	viewer: {
		id: string
		shares: {
			id: string
			name: string
			songsDirty: ITimedstampedResults<IShareSong>
		}[]
	}
}

export interface IGetMergedViewDirtySongsVariables {
	lastTimestamp: Date
}

export const GET_MERGED_VIEW_DIRTY_SONGS = gql`
	query MergedViewSongsDirty($lastTimestamp: DateTime!) {
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
`

const getSongsDiff = (currentSongs: IShareSong[], dirtySongs: IShareSong[]) => {
	const dirtySongIDs = new Set(dirtySongs.map((song) => song.id))
	const currentSongIDs = new Set(currentSongs.map((song) => song.id))
	const newSongs = dirtySongs.filter((newSong) => !currentSongIDs.has(newSong.id))

	return { dirtySongIDs, newSongs }
}

const updateShareSongs = (cache: ApolloClient<unknown>, shareID: string, songsDirty: IShareSong[]) => {
	const currentShareSongs = cache.readQuery<IGetShareWithSongsData, IGetShareWithSongsVariables>({
		query: GET_SHARE_WITH_SONGS,
		variables: {
			shareID,
		},
	})

	if (!currentShareSongs) return

	const { dirtySongIDs, newSongs } = getSongsDiff(currentShareSongs.share.songs, songsDirty)

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
							? songsDirty.find((dirtySong) => dirtySong.id === song.id) || song
							: song,
					)
					.concat(newSongs),
			},
		},
	})
}

export const useShareDirtySongs = (shareID: string) => {
	const cache = useApolloClient()
	const lastUpdateTimestamp = useRef<Date>(new Date())

	const updateCache = useCallback(
		(data: IGetShareDirtySongsData) => {
			lastUpdateTimestamp.current = data.share.songsDirty.timestamp

			if (data.share.songsDirty.nodes.length === 0) return

			updateShareSongs(cache, shareID, data.share.songsDirty.nodes)
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

export const useMergedViewDirtySongs = () => {
	const cache = useApolloClient()
	const lastUpdateTimestamp = useRef<Date>(new Date())

	const updateCache = useCallback(
		(data: IGetMergedViewDirtySongsData) => {
			if (data.viewer.shares.length === 0) return

			lastUpdateTimestamp.current = data.viewer.shares[0].songsDirty.timestamp

			try {
				for (const share of data.viewer.shares) {
					if (share.songsDirty.nodes.length === 0) continue

					updateShareSongs(cache, share.id, share.songsDirty.nodes)
				}
			} catch (err) {
				console.error(err)
			}

			const currentMergedSongs = cache.readQuery<IGetMergedSongsData, void>({
				query: GET_MERGED_SONGS,
			})

			if (!currentMergedSongs) return

			cache.writeQuery<IGetMergedSongsData, void>({
				query: GET_MERGED_SONGS,
				data: {
					...currentMergedSongs,
					viewer: {
						...currentMergedSongs.viewer,
						shares: currentMergedSongs.viewer.shares.map((currentShare) => {
							const updatedShare = data.viewer.shares.find((share) => share.id === currentShare.id)

							if (!updatedShare) return currentShare

							const songsDirty = updatedShare.songsDirty.nodes
							const { dirtySongIDs, newSongs } = getSongsDiff(currentShare.songs, songsDirty)
							const songs = currentShare.songs
								.map((song) =>
									dirtySongIDs.has(song.id)
										? songsDirty.find((dirtySong) => dirtySong.id === song.id) || song
										: song,
								)
								.concat(newSongs)

							return {
								...currentShare,
								songs,
							}
						}),
					},
				},
			})
		},
		[cache],
	)

	const { refetch } = useQuery<IGetMergedViewDirtySongsData, IGetMergedViewDirtySongsVariables>(
		GET_MERGED_VIEW_DIRTY_SONGS,
		{
			fetchPolicy: "network-only",
			skip: true,
		},
	)

	const onInterval = useCallback(() => {
		refetch({
			lastTimestamp: lastUpdateTimestamp.current,
		}).then((result) => {
			// onCompleted is broken for refetch, use this workaround for now
			// https://github.com/apollographql/react-apollo/issues/3709
			if (result.data) {
				updateCache(result.data)
			}
		})
	}, [refetch, updateCache])

	useInterval(onInterval, 10e3)
}
