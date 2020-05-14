import { Permission, UserStatus, IPlaylistSong } from "@musicshare/shared-types"

export interface IShareVariables {
	shareID: string
}

export interface IShareData {
	shareID: string
}

export interface IShare {
	id: string
	__typename: "Share"
	name: string
	userID: string
	isLibrary: boolean
	userPermissions: Permission[]
}

export interface IUser {
	id: string
	name: string
	email: string
	status: UserStatus
}

export interface IUserWithShares extends IUser {
	user: {
		shares: IShare[]
	}
}

export const userKeys = `
	id
	name
	email
	status
`

export interface IUserVariables {
	id: string
}

export const isPlaylistSong = (obj: any): obj is IPlaylistSong =>
	typeof obj === "object" && typeof obj.playlistSongID === "string"

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
`

export const shareSongKeys = `
	${baseSongKeys}
	shareID
`

export const playlistSongKeys = `
	${shareSongKeys}
	playlistSongID
`

export const shareKeys = `
	id
	name
	isLibrary
	userPermissions
`

export interface IFile {
	readonly container: string
	readonly blob: string
	readonly fileExtension: string
	readonly originalFilename: string
}

export interface IGenre {
	name: string
	group: string
}

export interface ISongType extends IGenre {
	hasArtists: boolean
	alternativeNames: string[]
}

export interface IArtist {
	name: string
}

export interface IPlaylist {
	id: string
	name: string
	shareID: string
	dateAdded: string
}

export interface IPlaylistWithSongs extends IPlaylist {
	songs: IPlaylistSong[]
	__typename: "Playlist"
}
