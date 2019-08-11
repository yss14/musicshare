import { useContext, useState, useReducer, useEffect } from "react";
import { PlayerContext } from "./player-context";
import { IBaseSongPlayable } from "../graphql/types";
import { PlayerEvent } from "./player";

interface ISetVolume {
	type: 'set_volume';
	data: number;
}

const setVolume = (newVolume: number): ISetVolume => ({ type: 'set_volume', data: newVolume });

type PlayerAction = PlayerEvent | ISetVolume;

interface IPlayerState {
	playing: boolean;
	playpackProgress: number;
	volume: number;
	currentSong: IBaseSongPlayable | null;
	duration: number;
}

const playerReducer: React.Reducer<IPlayerState, PlayerAction> = (state, action) => {
	switch (action.type) {
		case 'set_volume': return { ...state, volume: action.data };
		case 'playback_status': return { ...state, playing: action.data };
		case 'playback_progress': return { ...state, playpackProgress: action.data };
		case 'song_change': return { ...state, currentSong: action.data };
		case 'song_duration_change': return { ...state, duration: action.data };
		default: return state;
	}
}

const initialPlayerState: IPlayerState = {
	volume: 0.5,
	playing: false,
	playpackProgress: 0,
	currentSong: null,
	duration: 0,
}

export const usePlayer = () => {
	const player = useContext(PlayerContext);
	const [{ volume, playing, playpackProgress, currentSong, duration }, dispatch] = useReducer(playerReducer, initialPlayerState);

	useEffect(() => {
		player.subscribeEvents(dispatch);

		return () => player.unsubscribeEvents(dispatch);
	}, [player, dispatch]);

	return {
		play: () => player.play(),
		pause: () => player.pause(),
		next: () => player.next(),
		prev: () => player.prev(),
		changeVolume: (newVolume: number) => {
			player.changeVolume(newVolume);
			dispatch(setVolume(newVolume));
		},
		seek: (newCurrentTime: number) => player.seek(newCurrentTime),
		changeSong: (newSong: IBaseSongPlayable) => player.changeSong(newSong),
		enqueueSong: (song: IBaseSongPlayable) => player.enqueueSong(song),
		volume,
		playing,
		playpackProgress,
		currentSong,
		duration,
	}
}