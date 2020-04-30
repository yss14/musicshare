import React, { useReducer, useContext, useMemo, useEffect } from "react"
import { Player, PlayerEvent, ISongQueueItem, IPlayer } from "./player"
import { IBaseSongPlayable } from "../graphql/types"

export const PlayerContext = React.createContext<[[IPlayerState, React.Dispatch<any>] | null, IPlayer]>([
	null,
	Player(),
])

export const usePlayerState = () => {
	const state = useContext(PlayerContext)[0]

	if (!state) {
		throw new Error(`usePlayerState() can only be used inside PlayerContext`)
	}

	return state
}

interface ISetVolume {
	type: "set_volume"
	data: number
}

export const setVolume = (newVolume: number): ISetVolume => ({ type: "set_volume", data: newVolume })

interface ISetIsDefaultSongQueue extends ReturnType<typeof setIsDefaultSongQueue> {}

export const setIsDefaultSongQueue = (isDefaultSongQueue: boolean) => ({
	type: "set_is_default_song_queue" as const,
	data: isDefaultSongQueue,
})

type PlayerAction = PlayerEvent | ISetVolume | ISetIsDefaultSongQueue

interface IPlayerState {
	playing: boolean
	playpackProgress: number
	bufferingProgress: number
	volume: number
	currentSong: IBaseSongPlayable | null
	duration: number
	error: string | null
	songQueue: ISongQueueItem[]
	isDefaultSongQueue: boolean
}

const playerReducer: React.Reducer<IPlayerState, PlayerAction> = (state, action) => {
	switch (action.type) {
		case "set_volume":
			return { ...state, volume: action.data }
		case "playback_status":
			return { ...state, playing: action.data }
		case "playback_progress":
			return { ...state, playpackProgress: action.data }
		case "buffering_progress":
			return { ...state, bufferingProgress: action.data }
		case "song_change":
			return { ...state, currentSong: action.data, error: null, playpackProgress: 0, bufferingProgress: 0 }
		case "song_duration_change":
			return { ...state, duration: action.data, error: null }
		case "playback_error":
			return { ...state, error: action.data }
		case "update_song_queue":
			return { ...state, songQueue: action.data }
		case "set_is_default_song_queue":
			return { ...state, isDefaultSongQueue: action.data }
		default:
			return state
	}
}

const initialPlayerState: IPlayerState = {
	volume: 0.5,
	playing: false,
	playpackProgress: 0,
	bufferingProgress: 0,
	currentSong: null,
	duration: 0,
	error: null,
	songQueue: [],
	isDefaultSongQueue: false,
}

export const PlayerProvider: React.FC = ({ children }) => {
	const reducer = useReducer(playerReducer, initialPlayerState)
	const player = useMemo(() => Player(), [])

	useEffect(() => {
		console.log("Player provider mounts")
		return () => {
			console.log("Player provider unmounts")
			player.destroy()
		}
	}, [player])

	return <PlayerContext.Provider value={[reducer, player]}>{children}</PlayerContext.Provider>
}
