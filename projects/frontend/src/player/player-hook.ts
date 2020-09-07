import { useCallback } from "react"
import { IPlayerQueueItem, usePlayerQueueState, useUpdatePlayerState } from "../components/player/player-state"
import { v4 as uuid } from "uuid"
import { usePlayerContext } from "./PlayerContext"
import { ShareSong } from "@musicshare/shared-types"

const QueueItem = (song: ShareSong): IPlayerQueueItem => ({
	id: uuid(),
	song,
})

export const usePlayerActions = () => {
	const { primaryDeck, next, prev } = usePlayerContext()

	const changeSong = useCallback(
		async (newSong: ShareSong) => {
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
	const { isDefaultQueue, queue } = usePlayerQueueState()
	const updatePlayerState = useUpdatePlayerState()

	const setSongQueue = useCallback(
		(items: IPlayerQueueItem[]) => {
			updatePlayerState({
				queue: items,
			})
		},
		[updatePlayerState],
	)

	const enqueueSong = useCallback(
		(song: ShareSong) => {
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
		(songs: ShareSong[]) => {
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
		(song: ShareSong) => {
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
		(songs: ShareSong[]) => {
			updatePlayerState({
				isDefaultQueue: true,
				queue: songs.map((song) => QueueItem(song)),
			})
		},
		[updatePlayerState],
	)

	const clearQueue = useCallback(() => {
		updatePlayerState({ queue: [] })
	}, [updatePlayerState])

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
