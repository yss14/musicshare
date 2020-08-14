import { useCallback, useMemo } from "react"
import {
	makeUpdatePlayerState,
	IPlayerQueueItem,
	useSetPlayerQueue,
	usePlayerQueueState,
} from "../components/player/player-state"
import { useApolloClient } from "@apollo/client"
import { v4 as uuid } from "uuid"
import { usePlayerContext } from "./PlayerContext"
import { IShareSong } from "@musicshare/shared-types"

const QueueItem = (song: IShareSong): IPlayerQueueItem => ({
	__typename: "PlayerQueueItem",
	id: uuid(),
	song,
})

export const usePlayerActions = () => {
	const { primaryDeck, next, prev } = usePlayerContext()

	const changeSong = useCallback(
		async (newSong: IShareSong) => {
			await next(newSong)
		},
		[next],
	)

	const play = useCallback(() => {
		primaryDeck.play()
	}, [primaryDeck])

	const pause = useCallback(() => {
		primaryDeck.pause()
	}, [primaryDeck])

	const changeVolume = useCallback(
		(volume: number) => {
			primaryDeck.volume = volume
		},
		[primaryDeck],
	)

	const seek = useCallback(
		(newPos: number) => {
			primaryDeck.currentTime = newPos
		},
		[primaryDeck],
	)

	return {
		play,
		pause,
		changeVolume,
		next,
		prev,
		changeSong,
		seek,
	}
}

export const usePlayerQueue = () => {
	const { data } = usePlayerQueueState()
	const { isDefaultQueue, queue } = data!.player

	const client = useApolloClient()

	const updatePlayerState = useMemo(() => makeUpdatePlayerState(client), [client])
	const [setPlayerQueue] = useSetPlayerQueue()

	const setSongQueue = useCallback(
		(items: IPlayerQueueItem[]) => {
			updatePlayerState({
				queue: items,
			})
		},
		[updatePlayerState],
	)

	const enqueueSong = useCallback(
		(song: IShareSong) => {
			const newItem = QueueItem(song)
			const newQueue = isDefaultQueue ? [newItem] : [...queue, newItem]

			updatePlayerState({
				queue: newQueue,
				isDefaultQueue: false,
			})
		},
		[updatePlayerState, queue, isDefaultQueue],
	)

	const enqueueSongs = useCallback(
		(songs: IShareSong[]) => {
			const newItems = songs.map((song) => QueueItem(song))
			const newQueue = isDefaultQueue ? newItems : [...queue, ...newItems]

			updatePlayerState({
				queue: newQueue,
				isDefaultQueue: false,
			})
		},
		[updatePlayerState, queue, isDefaultQueue],
	)

	const enqueueSongNext = useCallback(
		(song: IShareSong) => {
			const newItem = QueueItem(song)
			const newQueue = isDefaultQueue ? [newItem] : [newItem, ...queue]

			updatePlayerState({
				queue: newQueue,
				isDefaultQueue: false,
			})
		},
		[updatePlayerState, queue, isDefaultQueue],
	)

	const enqueueDefaultSongs = useCallback(
		(songs: IShareSong[]) => {
			updatePlayerState({
				isDefaultQueue: true,
			})
			setPlayerQueue({
				variables: { items: songs.map((song) => QueueItem(song)) },
			})
		},
		[updatePlayerState, setPlayerQueue],
	)

	const clearQueue = useCallback(() => {
		setPlayerQueue({
			variables: { items: [] },
		})
	}, [setPlayerQueue])

	return {
		setSongQueue,
		enqueueSong,
		enqueueSongs,
		enqueueSongNext,
		enqueueDefaultSongs,
		clearQueue,
		queue,
		isDefaultQueue,
	}
}
