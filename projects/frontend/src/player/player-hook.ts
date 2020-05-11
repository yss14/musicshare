import { useCallback, useMemo } from "react"
import { IScopedSong } from "../graphql/types"
import {
	makeUpdatePlayerState,
	usePlayerState,
	IPlayerQueueItem,
	useSetPlayerQueue,
} from "../components/player/player-state"
import { useApolloClient } from "react-apollo"
import { makeGetSongMediaUrls } from "../graphql/programmatic/get-song-mediaurl"
import { v4 as uuid } from "uuid"
import { usePlayerContext, pickMediaUrl } from "./PlayerContext"

/*export const useOldPlayer = () => {
	const player = useContext(PlayerContext)[1]
	const [
		{
			volume,
			playing,
			playbackProgress,
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
		playbackProgress,
		bufferingProgress,
		currentSong,
		duration,
		error,
		songQueue,
	}
}*/

const QueueItem = (song: IScopedSong): IPlayerQueueItem => ({
	__typename: "PlayerQueueItem",
	id: uuid(),
	song,
})

export const usePlayer = () => {
	const { primaryDeck, bufferingDeck, setIsBufferingNextSong, setPlayCountIncremented } = usePlayerContext()
	const { data } = usePlayerState()
	console.log(data)
	const { currentSong, queue, isDefaultQueue } = data!.player

	const [setPlayerQueue] = useSetPlayerQueue()

	//const playedSongs = useRef<any[]>([])
	const client = useApolloClient()

	const updatePlayerState = useMemo(() => makeUpdatePlayerState(client), [client])
	const getMediaUrls = useMemo(() => makeGetSongMediaUrls(client), [client])

	const next = useCallback(
		async (song?: IScopedSong) => {
			if (currentSong) {
				//playedSongs.current.push(currentSong)
			}
			let nextSong = song

			if (!nextSong) {
				// TODO factor this out
				const newQueue = [...queue]
				const nextItem = newQueue.shift()
				nextSong = nextItem?.song

				updatePlayerState({
					queue: newQueue,
				})
			}
			console.log({ nextSong })

			setIsBufferingNextSong(false)

			bufferingDeck.src = ""
			primaryDeck.setAttribute("src", "")

			if (!nextSong) {
				updatePlayerState({
					currentSong: null,
					playing: false,
				})

				return false
			}

			const songMediaUrls = await getMediaUrls(nextSong.shareID, nextSong.id)

			updatePlayerState({
				currentSong: nextSong,
			})

			const mediaUrl = pickMediaUrl(songMediaUrls)

			if (mediaUrl) {
				primaryDeck.src = mediaUrl
				primaryDeck.play()

				setPlayCountIncremented(false)
			} else {
				console.warn(`Cannot get a media url of song ${nextSong.id}`)

				await next()
			}
		},
		[
			currentSong,
			getMediaUrls,
			queue,
			updatePlayerState,
			bufferingDeck,
			primaryDeck,
			setIsBufferingNextSong,
			setPlayCountIncremented,
		],
	)

	const prev = useCallback(() => {}, [])

	const setSongQueue = useCallback(
		(items: IPlayerQueueItem[]) => {
			updatePlayerState({
				queue: items,
			})
		},
		[updatePlayerState],
	)

	const changeSong = useCallback(
		async (newSong: IScopedSong) => {
			await next(newSong)
		},
		[next],
	)

	const enqueueSong = useCallback(
		(song: IScopedSong) => {
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
		(songs: IScopedSong[]) => {
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
		(song: IScopedSong) => {
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
		(songs: IScopedSong[]) => {
			console.log(
				"Default songs",
				songs.map((song) => QueueItem(song)),
			)
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
		// TODO
	}, [])

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
		setSongQueue,
		enqueueSong,
		enqueueSongs,
		enqueueSongNext,
		enqueueDefaultSongs,
		seek,
		clearQueue,

		// TODO remove
		...data!.player,
	}
}
