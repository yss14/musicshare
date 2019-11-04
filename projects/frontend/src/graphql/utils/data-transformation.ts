export const makeShareSong = <T>(song: T, shareID: string): (T & { shareID: string }) => {
	return { ...song, shareID }
}

export const makeShareSongs = <T>(songs: T[], shareID: string): (T & { shareID: string })[] => {
	return songs.map(song => makeShareSong(song, shareID))
}
