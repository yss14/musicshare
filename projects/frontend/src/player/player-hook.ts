import { useCallback, useMemo } from "react"
import { IScopedSong } from "../graphql/types"
import {
	makeUpdatePlayerState,
	usePlayerState,
	IPlayerQueueItem,
	useSetPlayerQueue,
	usePlayerQueueState,
} from "../components/player/player-state"
import { useApolloClient } from "react-apollo"
import { makeGetSongMediaUrls } from "../graphql/programmatic/get-song-mediaurl"
import { v4 as uuid } from "uuid"
import { usePlayerContext, pickMediaUrl } from "./PlayerContext"

const QueueItem = (song: IScopedSong): IPlayerQueueItem => ({
	__typename: "PlayerQueueItem",
	id: uuid(),
	song,
})

export const usePlayer = () => {
	const {
		primaryDeck,
		bufferingDeck,
		setIsBufferingNextSong,
		setPlayCountIncremented,
		playedSongs,
		setPlayedSongs,
	} = usePlayerContext()
	const { data } = usePlayerState()
	const { currentSong, queue } = data!.player

	const client = useApolloClient()

	const updatePlayerState = useMemo(() => makeUpdatePlayerState(client), [client])
	const getMediaUrls = useMemo(() => makeGetSongMediaUrls(client), [client])

	const next = useCallback(
		async (song?: IScopedSong) => {
			if (currentSong) {
				setPlayedSongs((currentPlayedSongs) => [...currentPlayedSongs, currentSong])
			}
			let nextSong = song

			if (!nextSong) {
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
				error: null,
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
			setPlayedSongs,
		],
	)

	const prev = useCallback(async () => {
		const newLastPlayedSongs = [...playedSongs]
		const prevSong = newLastPlayedSongs.pop()
		setPlayedSongs(newLastPlayedSongs)

		if (!prevSong) {
			return
		}

		const songMediaUrls = await getMediaUrls(prevSong.shareID, prevSong.id)

		updatePlayerState({
			currentSong: prevSong,
			error: null,
		})

		const mediaUrl = pickMediaUrl(songMediaUrls)

		if (mediaUrl) {
			primaryDeck.src = mediaUrl
			primaryDeck.play()

			setPlayCountIncremented(false)
		} else {
			console.warn(`Cannot get a media url of song ${prevSong.id}`)

			await prev()
		}
	}, [getMediaUrls, playedSongs, primaryDeck, setPlayCountIncremented, setPlayedSongs, updatePlayerState])

	const changeSong = useCallback(
		async (newSong: IScopedSong) => {
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

		// TODO remove
		...data!.player,
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
