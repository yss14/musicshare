import { shareSongKeys } from "../types"
import gql from "graphql-tag"
import { useQuery, useApolloClient, ApolloClient } from "@apollo/client"
import { useCallback, useRef, useState } from "react"
import { ITimedstampedResults, IShareSong } from "@musicshare/shared-types"
import useSetTimeout from "use-set-timeout"

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

const getSongsDiff = (currentSongs: IShareSong[], dirtySongs: IShareSong[]) => {
	const dirtySongIDs = new Set(dirtySongs.map((song) => song.id))
	const currentSongIDs = new Set(currentSongs.map((song) => song.id))
	const newSongs = dirtySongs.filter((newSong) => !currentSongIDs.has(newSong.id))

	return { dirtySongIDs, newSongs }
}

const updateShareSongs = (cache: ApolloClient<unknown>, shareID: string, songsDirty: IShareSong[]) => {
	return
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

	useQuery<IGetShareDirtySongsData, IGetShareDirtySongsVariables>(GET_SHARE_DIRTY_SONGS, {
		fetchPolicy: "network-only",
		pollInterval: 10e3,
		onCompleted: (data) => {
			updateCache(data)
		},
		variables: { shareID, lastTimestamp: lastUpdateTimestamp.current },
	})
}

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

export const useMergedViewDirtySongs = () => {
	const cache = useApolloClient()
	const lastUpdateTimestamp = useRef<Date>(new Date())
	const [skip, setSkip] = useState(true)

	const updateCache = useCallback(
		(data: IGetMergedViewDirtySongsData) => {
			/*console.log("updateCache")
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
			console.log({ currentMergedSongs })

			cache.writeQuery<IGetMergedSongsData, void>({
				query: GET_MERGED_SONGS,
				data: {
					...currentMergedSongs,
					viewer: {
						...currentMergedSongs.viewer,
						shares: currentMergedSongs.viewer.shares.map((currentShare) => {
							const updatedShare = data.viewer.shares.find((share) => share.id === currentShare.id)

							if (!updatedShare) return currentShare
							console.log(currentShare)
							const currentSongs = currentShare.songs ?? []
							const songsDirty = updatedShare.songsDirty.nodes
							const { dirtySongIDs, newSongs } = getSongsDiff(currentSongs, songsDirty)

							const songs = currentSongs
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
			})*/
		},
		[cache],
	)

	useQuery<IGetMergedViewDirtySongsData, IGetMergedViewDirtySongsVariables>(GET_MERGED_VIEW_DIRTY_SONGS, {
		fetchPolicy: "network-only",
		variables: {
			lastTimestamp: lastUpdateTimestamp.current,
		},
		onCompleted: (data) => updateCache(data),
		pollInterval: 30e3,
		skip,
	})

	// workaround for waiting until results from useMergedSongs() are dispatched to the cache, otherwise error
	useSetTimeout(() => {
		setSkip(false)
	}, 10e3)
}
