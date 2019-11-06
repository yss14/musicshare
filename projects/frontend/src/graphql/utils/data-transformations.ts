import { IBaseSong, IScopedSong } from "../types";

export const makeScopedSong = (song: IBaseSong, shareID: string): IScopedSong => ({
	...song,
	shareID,
})

export const makeScopedSongs = (songs: IBaseSong[], shareID: string): IScopedSong[] =>
	songs.map(song => makeScopedSong(song, shareID))