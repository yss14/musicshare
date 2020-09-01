import { ShareSong } from "@musicshare/shared-types"

export const getSongsDiff = (currentSongs: ShareSong[], dirtySongs: ShareSong[]) => {
	const dirtySongIDs = new Set(dirtySongs.map((song) => song.id))
	const currentSongIDs = new Set(currentSongs.map((song) => song.id))
	const newSongs = dirtySongs.filter((newSong) => !currentSongIDs.has(newSong.id))

	return { dirtySongIDs, newSongs }
}
