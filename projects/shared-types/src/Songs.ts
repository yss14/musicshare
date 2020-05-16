export interface IBaseSong {
	id: string
	title: string
	suffix: string | null
	year: number | null
	bpm: number | null
	dateLastEdit: string
	releaseDate: string | null
	isRip: boolean
	artists: string[]
	remixer: string[]
	featurings: string[]
	type: string | null
	genres: string[]
	labels: string[]
	duration: number
	tags: string[]
	libraryID: string
	dateAdded: string
	playCount: number
	numberOfSources: number
}

export interface IShareSong extends IBaseSong {
	shareID: string
}

export interface IPlaylistSong extends IShareSong {
	playlistSongID: string
	position: number
}
