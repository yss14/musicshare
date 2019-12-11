export function makeScopedSong<T>(song: T, shareID: string): T & { shareID: string } {
	return {
		...song,
		shareID,
	}
}

export function makeScopedSongs<T>(songs: T[], shareID: string): (T & { shareID: string })[] {
	return songs.map(song => makeScopedSong(song, shareID))
}