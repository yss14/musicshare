import { IBaseSongPlayable } from "../graphql/types";

const PlayerDeck = () => {
	const audio = document.createElement('audio');
	audio.style.display = 'none';
	document.body.appendChild(audio);

	return audio;
}

const getPlaybackProgress = (deck: HTMLAudioElement) => {
	return (deck.currentTime / deck.duration) || -1;
}

interface IPlaybackStatusEvent {
	type: 'playback_status';
	data: boolean;
}

const setPlaying = (): IPlaybackStatusEvent => ({ type: 'playback_status', data: true });
const setPaused = (): IPlaybackStatusEvent => ({ type: 'playback_status', data: false });

interface IPlaybackProgressEvent {
	type: 'playback_progress';
	data: number;
}

const setProgress = (newProgress: number): IPlaybackProgressEvent => ({ type: 'playback_progress', data: newProgress });

interface ISongChangeEvent {
	type: 'song_change';
	data: IBaseSongPlayable | null;
}

const setSong = (newSong: IBaseSongPlayable | null): ISongChangeEvent => ({ type: 'song_change', data: newSong });

interface ISongDurationChangeEvent {
	type: 'song_duration_change';
	data: number;
}

const setSongDuration = (newDuration: number): ISongDurationChangeEvent => ({ type: 'song_duration_change', data: newDuration });

export type PlayerEvent = IPlaybackStatusEvent | IPlaybackProgressEvent | ISongChangeEvent | ISongDurationChangeEvent;

type PlayerEventSubscriber = (event: PlayerEvent) => unknown;

export interface IPlayer {
	play: () => void;
	pause: () => void;
	next: () => void;
	prev: () => void;
	changeVolume: (newVolume: number) => void;
	changeSong: (newSong: IBaseSongPlayable) => void;
	enqueueSong: (song: IBaseSongPlayable) => void;
	enqueueSongs: (songs: IBaseSongPlayable[]) => void;
	clearQueue: () => void;
	subscribeEvents: (callback: PlayerEventSubscriber) => void;
	unsubscribeEvents: (callback: PlayerEventSubscriber) => void;
	seek: (newCurrentTime: number) => void;
}

export const Player = (): IPlayer => {
	const primaryDeck = PlayerDeck();
	const bufferingDeck = PlayerDeck();
	bufferingDeck.volume = 0;

	const songQueue: IBaseSongPlayable[] = [];
	const playedSongs: IBaseSongPlayable[] = [];
	let isBufferingNextSong = false;

	const eventSubscribers: Set<PlayerEventSubscriber> = new Set();

	const subscribeEvents = (callback: PlayerEventSubscriber) => eventSubscribers.add(callback);
	const unsubscribeEvents = (callback: PlayerEventSubscriber) => eventSubscribers.delete(callback);

	const dispatch = (event: PlayerEvent) => Array.from(eventSubscribers)
		.forEach(subscriber => subscriber(event));

	const play = () => primaryDeck.play();
	const pause = () => primaryDeck.pause();
	const changeVolume = (newVolume: number) => primaryDeck.volume = newVolume;
	const seek = (newCurrentTime: number) => primaryDeck.currentTime = newCurrentTime;

	const next = () => {
		const nextSong = songQueue.shift();
		isBufferingNextSong = false;
		bufferingDeck.src = "";

		if (!nextSong) return false;

		nextSong.getMediaURL().then(mediaURL => {
			dispatch(setSong(nextSong));

			primaryDeck.src = mediaURL;
			primaryDeck.play();
		});

		return true;
	}

	const prev = () => {
		const prevSong = playedSongs.pop();

		if (!prevSong) return;

		prevSong.getMediaURL().then(mediaURL => {
			primaryDeck.src = mediaURL;
			primaryDeck.play();
		});
	}

	const changeSong = (newSong: IBaseSongPlayable) => {
		songQueue.unshift(newSong);
		next();
	}

	const enqueueSong = (song: IBaseSongPlayable) => {
		songQueue.push(song);
	}

	const enqueueSongs = (songs: IBaseSongPlayable[]) => {
		songs.forEach(song => songQueue.push(song));
	}

	const clearQueue = () => songQueue.splice(0, songQueue.length);

	primaryDeck.addEventListener('ended', () => {
		const isNextSong = next();

		dispatch(setSong(null));
		dispatch(setSongDuration(0));
		dispatch(setProgress(0));

		if (!isNextSong) {
			dispatch(setPaused());
		}
	});
	primaryDeck.addEventListener('play', () => {
		dispatch(setPlaying());
	});
	primaryDeck.addEventListener('pause', () => {
		dispatch(setPaused());
	});
	primaryDeck.addEventListener('timeupdate', () => {
		const progress = primaryDeck.currentTime / primaryDeck.duration;

		dispatch(setProgress(progress));
	});
	primaryDeck.addEventListener('durationchange', () => {
		const { currentTime, duration } = primaryDeck;
		const progress = currentTime / duration;

		dispatch(setSongDuration(duration));
		dispatch(setProgress(progress));
	});

	setInterval(() => {
		const currentProgress = getPlaybackProgress(primaryDeck);

		if (primaryDeck.paused || currentProgress < 0) return;

		if (currentProgress >= 0.9 && songQueue.length > 0 && !isBufferingNextSong) {
			const nextSong = songQueue[0];
			isBufferingNextSong = true;
			console.log('Start buffering next song');

			nextSong.getMediaURL().then(mediaURL => {
				bufferingDeck.src = mediaURL;
			})
		}
	}, 500);

	return { play, pause, changeVolume, next, prev, changeSong, enqueueSong, enqueueSongs, subscribeEvents, unsubscribeEvents, seek, clearQueue }
}
