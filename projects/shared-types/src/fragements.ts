const baseSongKeys = `
	id
	title
	suffix
	year
	bpm
	dateLastEdit
	releaseDate
	isRip
	artists
	remixer
	featurings
	type
	genres
	labels
	tags
	duration
	dateAdded
	libraryID
	playCount
	numberOfSources
`

export const shareSongKeys = `
	${baseSongKeys}
	shareID
`

export const playlistSongKeys = `
	${shareSongKeys}
	playlistSongID
	position
`

export const shareKeys = `
	id
	name
	isLibrary
	userPermissions
`
export const userKeys = `
	id
	name
	email
`

export const memberKeys = `
	${userKeys}
	status
	permissions
	shareID
	dateJoined
`
export const playlistKeys = `
	id
	name
	shareID
	dateAdded
`

export const genreKeys = `
	id
	name
	group
`

export const songTypeKeys = `
	id
	name
	group
	alternativeNames
	hasArtists
`
