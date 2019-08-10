import { IBaseSongPlayable } from "../graphql/types";

interface IPlayerDeck {
	play: () => void;
	pause: () => void;
	isPlaying: () => boolean;
	getPlaybackProgress: () => number;
	enqueueSong: (song: IBaseSongPlayable) => Promise<void>;
	on: (event: 'ended', callback: () => unknown) => void;
}

const PlayerDeck = (): IPlayerDeck => {
	const audio = document.createElement('audio');
	audio.style.display = 'none';
	document.body.appendChild(audio);

	const play = () => audio.play();
	const pause = () => audio.pause();
	const isPlaying = () => !audio.paused;
	const getPlaybackProgress = () => {
		const progress = audio.currentTime / audio.duration;

		return progress || -1;
	}

	const enqueueSong = async (song: IBaseSongPlayable) => {
		const mediaURL = await song.getMediaURL();

		audio.src = mediaURL;
	}

	const on = (event: string, callback: () => unknown) => audio.addEventListener(event, callback);

	return { play, pause, isPlaying, enqueueSong, getPlaybackProgress, on }
}

export interface IPlayer {
	play: () => void;
	pause: () => void;
	next: () => void;
	prev: () => void;
	changeVolume: (newVolume: number) => void;
	changeSong: (newSong: IBaseSongPlayable) => void;
	enqueueSong: (song: IBaseSongPlayable) => void;
}

export const Player = (): IPlayer => {
	let currentDeck = PlayerDeck();
	let nextDeck = PlayerDeck();
	const songQueue: IBaseSongPlayable[] = [];
	const playedSongs: IBaseSongPlayable[] = [];

	const play = () => currentDeck.play();
	const pause = () => currentDeck.pause();
	const changeVolume = () => undefined; // TODO

	const next = () => {
		const nextSong = songQueue.shift();

		if (!nextSong) return;

		currentDeck.enqueueSong(nextSong)
			.then(() => currentDeck.play());
	}

	const prev = () => {
		const prevSong = playedSongs.pop();

		if (!prevSong) return;

		currentDeck.enqueueSong(prevSong)
			.then(() => currentDeck.play());
	}

	const changeSong = (newSong: IBaseSongPlayable) => {
		songQueue.unshift(newSong);
		next();
	}

	const enqueueSong = (song: IBaseSongPlayable) => {
		songQueue.push(song);

		if (!currentDeck.isPlaying) {
			next();
		}
	}

	const switchDecks = () => {
		const currentDeckRef = currentDeck;
		currentDeck = nextDeck
		nextDeck = currentDeckRef

		currentDeck.play();
	}

	const onDeckFinish = () => {
		switchDecks();
	}

	currentDeck.on('ended', onDeckFinish);
	nextDeck.on('ended', onDeckFinish);

	setInterval(() => {
		const currentProgress = currentDeck.getPlaybackProgress();

		if (!currentDeck.isPlaying() || currentProgress < 0) return;

		if (currentProgress >= 0.9) {
			const nextSong = songQueue.shift();

			if (!nextSong) return;

			nextDeck.enqueueSong(nextSong)
		}
	}, 500);

	return { play, pause, changeVolume, next, prev, changeSong, enqueueSong }
}
