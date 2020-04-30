import { useContext, useEffect, useCallback } from "react"
import { PlayerContext, setIsDefaultSongQueue, setVolume, usePlayerState } from "./PlayerContext"
import { IBaseSongPlayable } from "../graphql/types"
import { updateSongQueue, ISongQueueItem } from "./player"

export const usePlayer = () => {
	const player = useContext(PlayerContext)[1]
	const [
		{
			volume,
			playing,
			playpackProgress,
			currentSong,
			duration,
			bufferingProgress,
			error,
			isDefaultSongQueue,
			songQueue,
		},
		dispatch,
	] = usePlayerState()

	useEffect(() => {
		player.subscribeEvents(dispatch)

		return () => player.unsubscribeEvents(dispatch)
	}, [player, dispatch])

	const enqueueDefaultSongs = useCallback(
		(followupSongs: IBaseSongPlayable[]) => {
			dispatch(setIsDefaultSongQueue(true))
			dispatch(updateSongQueue([]))

			player.enqueueSongs(followupSongs)
		},
		[player, dispatch],
	)

	const enqueueSongs = useCallback(
		(songs: IBaseSongPlayable[]) => {
			if (isDefaultSongQueue) {
				player.clearQueue()
			}

			dispatch(setIsDefaultSongQueue(false))

			player.enqueueSongs(songs)
		},
		[player, isDefaultSongQueue, dispatch],
	)

	const enqueueSong = useCallback(
		(song: IBaseSongPlayable) => {
			if (isDefaultSongQueue) {
				player.clearQueue()
			}

			dispatch(setIsDefaultSongQueue(false))

			player.enqueueSong(song)
		},
		[player, isDefaultSongQueue, dispatch],
	)

	const enqueueSongNext = useCallback(
		(song: IBaseSongPlayable) => {
			if (isDefaultSongQueue) {
				player.clearQueue()
			}

			dispatch(setIsDefaultSongQueue(false))

			player.enqueueSongNext(song)
		},
		[player, isDefaultSongQueue, dispatch],
	)

	const setSongQueue = useCallback(
		(songs: ISongQueueItem[]) => {
			player.setSongQueue(songs)
		},
		[player],
	)

	return {
		play: () => player.play(),
		pause: () => player.pause(),
		next: () => player.next(),
		prev: () => player.prev(),
		changeVolume: (newVolume: number) => {
			player.changeVolume(newVolume)
			dispatch(setVolume(newVolume))
		},
		seek: player.seek,
		changeSong: player.changeSong,
		enqueueSong,
		enqueueSongs,
		enqueueDefaultSongs,
		enqueueSongNext,
		clearQueue: player.clearQueue,
		setSongQueue,
		destory: player.destroy,
		volume,
		playing,
		playpackProgress,
		bufferingProgress,
		currentSong,
		duration,
		error,
		songQueue,
	}
}
