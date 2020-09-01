import React, { useContext, useMemo, useEffect, useCallback, useState } from "react"
import useInterval from "@use-it/interval"
import { useApolloClient } from "@apollo/client"
import { makeUpdatePlayerState, usePlayerState } from "../components/player/player-state"
import { makeIncrementSongPlayCount } from "../graphql/programmatic/increment-song-playcount"
import { message } from "antd"
import { IShareSong } from "@musicshare/shared-types"
import { useDebouncedCallback } from "use-debounce"
import { useSongMediaUrl, ISongMediaUrl } from "@musicshare/graphql-client"

const getMediaErrorCode = (event: ErrorEvent) => {
	if (!event.target) {
		return -1
	}

	const target = event.target as HTMLAudioElement

	if (!target.error) {
		return -1
	}

	return target.error.code
}

const mapMediaElementEventError = (event: ErrorEvent) => {
	const mediaErrorCode = getMediaErrorCode(event)

	switch (mediaErrorCode) {
		case MediaError.MEDIA_ERR_ABORTED:
			return "You aborted the video playback."
		case MediaError.MEDIA_ERR_NETWORK:
			return "A network error caused the audio download to fail."
		case MediaError.MEDIA_ERR_DECODE:
			return "The audio playback was aborted due to a corruption problem or because the video used features your browser did not support."
		case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
			return "The audio cannot not be loaded because the server or network failed."
		default:
			return "An unknown error occurred."
	}
}

const PlayerDeck = () => {
	const audio = document.createElement("audio")
	audio.style.display = "none"
	document.body.appendChild(audio)

	return audio
}

const getPlaybackProgress = (deck: HTMLAudioElement) => {
	return deck.currentTime / deck.duration || -1
}

export const pickMediaUrl = (mediaUrls: ISongMediaUrl[]) => {
	const fileUploadMedia = mediaUrls.find((mediaUrl) => mediaUrl.__typename === "FileUpload")

	if (fileUploadMedia) {
		return fileUploadMedia.accessUrl
	}

	return null
}

interface IPlayer {
	primaryDeck: HTMLAudioElement
	bufferingDeck: HTMLAudioElement

	isBufferingNextSong: boolean
	setIsBufferingNextSong: React.Dispatch<React.SetStateAction<boolean>>

	next: (song?: IShareSong) => Promise<boolean>
	prev: () => Promise<void>
}

const PlayerContext = React.createContext<IPlayer | null>(null)

export const usePlayerContext = () => {
	const context = useContext(PlayerContext)

	if (!context) {
		throw new Error("usePlayerContext() can only be used inside PlayerProvider")
	}

	return context
}

let lastBufferingProgress = -1
let playerInitialized = false

export const PlayerProvider: React.FC = ({ children }) => {
	const playerDecks = useMemo(
		() => ({
			primaryDeck: PlayerDeck(),
			bufferingDeck: PlayerDeck(),
		}),
		[],
	)
	const { primaryDeck, bufferingDeck } = playerDecks

	const [isBufferingNextSong, setIsBufferingNextSong] = useState(false)
	const [playCountIncremented, setPlayCountIncremented] = useState(false)
	const [playedSongs, setPlayedSongs] = useState<IShareSong[]>([])

	const { data } = usePlayerState()
	const { queue, currentSong } = data!.player

	const client = useApolloClient()
	const updatePlayerState = useMemo(() => makeUpdatePlayerState(client), [client])
	const [getMediaUrls] = useSongMediaUrl()
	const incrementSongPlayCount = useMemo(() => makeIncrementSongPlayCount(client), [client])

	const destroy = useCallback(() => {
		try {
			primaryDeck.parentElement?.removeChild(primaryDeck)
			bufferingDeck.parentElement?.removeChild(bufferingDeck)
		} catch (err) {
			console.error(err)
		}
	}, [bufferingDeck, primaryDeck])

	useEffect(() => {
		if (playerInitialized) {
			return () => undefined
		}

		playerInitialized = true

		return () => destroy()
	}, [destroy])

	const next = useCallback(
		async (song?: IShareSong): Promise<boolean> => {
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

			const songMediaUrls = await getMediaUrls({ shareID: nextSong.shareID, songID: nextSong.id })

			if (!songMediaUrls) {
				console.error(`Couln't fetch song media url for shareID=${nextSong.shareID} songID=${nextSong.id}`)

				return false
			}

			updatePlayerState({
				currentSong: nextSong,
				error: null,
			})

			const mediaUrl = pickMediaUrl(songMediaUrls)

			if (mediaUrl) {
				primaryDeck.src = mediaUrl
				primaryDeck.play()

				setPlayCountIncremented(false)

				return true
			} else {
				console.warn(`Cannot get a media url of song ${nextSong.id}`)

				return await next()
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

		const songMediaUrls = await getMediaUrls({ shareID: prevSong.shareID, songID: prevSong.id })

		if (!songMediaUrls) {
			console.error(`Couln't fetch song media url for shareID=${prevSong.shareID} songID=${prevSong.id}`)

			return
		}

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

	const onPlayerEnded = useCallback(async () => {
		const hasNext = await next()

		if (!hasNext) {
			updatePlayerState({
				currentSong: null,
				duration: 0,
				playbackProgress: 0,
				bufferingProgress: 0,
			})
		}
	}, [updatePlayerState, next])

	const onPlayerPlay = useCallback(() => {
		updatePlayerState({
			playing: true,
		})
	}, [updatePlayerState])

	const onPlayerPause = useCallback(() => {
		updatePlayerState({
			playing: false,
		})
	}, [updatePlayerState])

	const onPlayerTimeUpdate = useCallback(() => {
		const progress = primaryDeck.currentTime / primaryDeck.duration

		updatePlayerState({
			playbackProgress: progress,
		})

		if (!playCountIncremented && progress >= 0.7 && currentSong) {
			setPlayCountIncremented(true)

			incrementSongPlayCount(currentSong.id, currentSong.shareID).catch(console.error)
		}
	}, [updatePlayerState, currentSong, incrementSongPlayCount, playCountIncremented, primaryDeck])

	const onPlayerDurationChange = useCallback(() => {
		const { currentTime, duration } = primaryDeck
		const progress = currentTime / duration

		updatePlayerState({
			duration: duration,
			playbackProgress: progress,
		})
	}, [updatePlayerState, primaryDeck])

	const onPlayerVolumeChange = useCallback(() => {
		updatePlayerState({
			volume: primaryDeck.volume,
		})
	}, [updatePlayerState, primaryDeck])

	const onAudioError = useCallback(
		async (err: ErrorEvent) => {
			const target = err.target as HTMLAudioElement

			// don't propagate error if we manually cleared the audio src attribute
			if ((target && target.src.length === 0) || target.src === window.location.href) {
				return
			}

			const errorMessage = mapMediaElementEventError(err)
			const code = getMediaErrorCode(err)

			if (target === primaryDeck) {
				if (code === MediaError.MEDIA_ERR_NETWORK && currentSong) {
					try {
						const currentPlaybackProgress = primaryDeck.currentTime

						const songMediaUrls = await getMediaUrls({
							shareID: currentSong.shareID,
							songID: currentSong.id,
						})

						if (!songMediaUrls) {
							console.error(
								`Couln't fetch song media url for shareID=${currentSong.shareID} songID=${currentSong.id}`,
							)

							return
						}

						const mediaUrl = pickMediaUrl(songMediaUrls)

						if (mediaUrl) {
							primaryDeck.src = mediaUrl
							primaryDeck.currentTime = currentPlaybackProgress
							primaryDeck.play()
						} else {
							console.warn(`Cannot get a media url of song ${currentSong.id}`)
						}
					} catch (err) {
						console.error(err)

						message.error(err.message)
					}
				} else if (primaryDeck.src.trim().length > 0) {
					updatePlayerState({
						error: errorMessage,
					})
				}
			}
		},
		[getMediaUrls, currentSong, updatePlayerState, primaryDeck],
	)

	const [onPlayerTimeUpdateDebounced] = useDebouncedCallback(onPlayerTimeUpdate, 500, { maxWait: 900 })
	const [onPlayerDurationChangeDebounced] = useDebouncedCallback(onPlayerDurationChange, 500, { maxWait: 900 })

	useEffect(() => {
		bufferingDeck.volume = 0

		primaryDeck.addEventListener("ended", onPlayerEnded)
		primaryDeck.addEventListener("play", onPlayerPlay)
		primaryDeck.addEventListener("pause", onPlayerPause)
		primaryDeck.addEventListener("timeupdate", onPlayerTimeUpdateDebounced)
		primaryDeck.addEventListener("durationchange", onPlayerDurationChangeDebounced)
		primaryDeck.addEventListener("volumechange", onPlayerVolumeChange)
		primaryDeck.addEventListener("error", onAudioError)

		return () => {
			primaryDeck.removeEventListener("ended", onPlayerEnded)
			primaryDeck.removeEventListener("play", onPlayerPlay)
			primaryDeck.removeEventListener("pause", onPlayerPause)
			primaryDeck.removeEventListener("timeupdate", onPlayerTimeUpdateDebounced)
			primaryDeck.removeEventListener("durationchange", onPlayerDurationChangeDebounced)
			primaryDeck.removeEventListener("volumechange", onPlayerVolumeChange)
			primaryDeck.removeEventListener("error", onAudioError)
		}
	}, [
		onPlayerEnded,
		onPlayerPlay,
		onPlayerPause,
		onPlayerTimeUpdateDebounced,
		onPlayerDurationChangeDebounced,
		onPlayerVolumeChange,
		onAudioError,
		primaryDeck,
		bufferingDeck,
	])

	const updateBufferingProgress = useCallback(() => {
		if (primaryDeck.buffered.length === 0) return

		const bufferingProgress = primaryDeck.buffered.end(0) / primaryDeck.duration

		if (Math.abs(lastBufferingProgress - bufferingProgress) > 0.01) {
			lastBufferingProgress = bufferingProgress

			updatePlayerState({
				bufferingProgress,
			})
		}
	}, [updatePlayerState, primaryDeck])

	const checkPrebufferingNextSong = useCallback(async () => {
		const currentProgress = getPlaybackProgress(primaryDeck)

		if (primaryDeck.paused || currentProgress < 0) return

		if (currentProgress >= 0.9 && queue.length > 0 && !isBufferingNextSong) {
			const nextSong = queue[0].song

			setIsBufferingNextSong(true)

			try {
				const songMediaUrls = await getMediaUrls({ shareID: nextSong.shareID, songID: nextSong.id })

				if (!songMediaUrls) {
					console.error(`Couln't fetch song media url for shareID=${nextSong.shareID} songID=${nextSong.id}`)

					return
				}

				const mediaUrl = pickMediaUrl(songMediaUrls)

				if (mediaUrl) {
					bufferingDeck.src = mediaUrl
				} else {
					console.warn(`Cannot get a media url of song ${nextSong.id}`)
				}
			} catch (err) {
				console.error(err)
			}
		}
	}, [getMediaUrls, queue, bufferingDeck, isBufferingNextSong, primaryDeck])

	useInterval(() => {
		updateBufferingProgress()
		checkPrebufferingNextSong()
	}, 500)

	const playerContextValue = useMemo(
		(): IPlayer => ({
			...playerDecks,
			isBufferingNextSong,
			setIsBufferingNextSong,
			next,
			prev,
		}),
		[playerDecks, isBufferingNextSong, next, prev],
	)

	return <PlayerContext.Provider value={playerContextValue}>{children}</PlayerContext.Provider>
}
