import { ISongMediaUrl } from "./queries/song-mediaurl-query";

export interface IShareVariables {
	shareID: string;
}

export interface IShareData {
	shareID: string;
}

export interface IShare {
	id: string;
	__typename: 'Share';
	name: string;
	userID: string;
	isLibrary: boolean;
	userPermissions: string[];
}

export interface IUser {
	id: string;
	name: string;
	email: string;
	status: 'accepted' | 'pending';
}

export interface IUserWithShares extends IUser {
	user: {
		shares: IShare[];
	};
}

export const userKeys = `
	id
	name
	email
	status
`

export interface IUserVariables {
	id: string;
}

export interface IBaseSong {
	id: string;
	title: string;
	suffix: string | null;
	year: number | null;
	bpm: number | null;
	dateLastEdit: string;
	releaseDate: string | null;
	isRip: boolean;
	artists: string[];
	remixer: string[];
	featurings: string[];
	type: string | null;
	genres: string[];
	labels: string[];
	duration: number;
	tags: string[];
	libraryID: string;
}

export interface IBaseSongPlayable extends IBaseSong {
	getMediaURL: () => Promise<ISongMediaUrl[]>;
}

export interface IShareSong extends IBaseSong {
	requiresUserAction: boolean;
}

export interface IPlaylistSong extends IBaseSong {
	playlistID: string;
	position: number;
	dateAdded: string;
}

/* 
	libraryID of IBaseSong represents the share a song is linked from.
	A scoped song allows to also carry information about the share a song is currently viewed from
*/
export interface IScopedSong extends IBaseSong {
	shareID: string;
}

export interface IScopedShareSong extends IShareSong, IScopedSong { }

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
`;

export const shareSongKeys = `
	${baseSongKeys}
`;

export const playlistSongKeys = `
	${baseSongKeys}
`;

export const shareKeys = `
	id
	name
	isLibrary
	userPermissions
`

export interface IFile {
	readonly container: string;
	readonly blob: string;
	readonly fileExtension: string;
	readonly originalFilename: string;
}

export interface IGenre {
	name: string;
	group: string;
}

export interface ISongType extends IGenre {
	hasArtists: boolean;
	alternativeNames: string[];
}

export interface IArtist {
	name: string;
}

export interface IPlaylist {
	id: string;
	name: string;
	shareID: string;
	dateAdded: string;
}

export interface IPlaylistWithSongs extends IPlaylist {
	songs: IPlaylistSong[];
	__typename: "Playlist";
}
