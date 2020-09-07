import { PlaylistSong } from "./generatedTypes"

export const isPlaylistSong = (obj: any): obj is PlaylistSong =>
	typeof obj === "object" && typeof obj.playlistSongID === "string"
