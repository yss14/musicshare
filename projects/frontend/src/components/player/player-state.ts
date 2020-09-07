import { IShareSong } from "@musicshare/shared-types"
import create from "zustand"
import shallow from "zustand/shallow"

const VOLUME_PERSIST_KEY = "player.volume"
const getPersistantVolume = () => parseFloat(window.localStorage.getItem(VOLUME_PERSIST_KEY) || "0.8")

export interface IPlayerQueueItem {
	id: string
	song: IShareSong
}

export type IPlayerState = {
	playing: boolean
	playbackProgress: number
	bufferingProgress: number
	volume: number
	currentSong: IShareSong | null
	duration: number
	error: string | null
	queue: IPlayerQueueItem[]
	isDefaultQueue: boolean

	update: <K extends keyof IPlayerState>(data: Pick<IPlayerState, K>) => void
}

const usePlayerStore = create<IPlayerState>((set) => ({
	playing: false,
	playbackProgress: 0,
	bufferingProgress: 0,
	volume: getPersistantVolume(),
	currentSong: null,
	duration: 0,
	error: null,
	queue: [],
	isDefaultQueue: true,

	update: (data) =>
		set((state) => {
			const newState = { ...state, ...data }

			if (newState.volume !== state.volume) {
				window.localStorage.setItem(VOLUME_PERSIST_KEY, String(newState.volume))
			}

			return newState
		}),
}))

export const usePlayerPlaybackState = () =>
	usePlayerStore(
		({ playing, playbackProgress, bufferingProgress, currentSong, duration, error }) => ({
			playing,
			playbackProgress,
			bufferingProgress,
			currentSong,
			duration,
			error,
		}),
		shallow,
	)

export const usePlayerQueueState = () =>
	usePlayerStore(({ queue, isDefaultQueue }) => ({ queue, isDefaultQueue }), shallow)

export const usePlayerSettingsState = () => usePlayerStore(({ volume }) => ({ volume }), shallow)

export const usePlayerState = () => usePlayerStore((state) => state, shallow)

export const useUpdatePlayerState = () => usePlayerStore(({ update }) => update)
