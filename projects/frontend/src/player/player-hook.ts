import { useContext } from "react";
import { PlayerContext } from "./player-context";
import { IBaseSongPlayable } from "../graphql/types";

export const usePlayer = () => {
	const player = useContext(PlayerContext);

	return {
		play: () => player.play(),
		pause: () => player.pause(),
		next: () => player.next(),
		prev: () => player.prev(),
		changeVolume: (newVolume: number) => player.changeVolume(newVolume),
		changeSong: (newSong: IBaseSongPlayable) => player.changeSong(newSong),
		enqueueSong: (song: IBaseSongPlayable) => player.enqueueSong(song),
	}
}