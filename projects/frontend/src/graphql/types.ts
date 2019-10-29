export interface IShareVariables {
	shareID: string;
}

export interface IShareData {
	shareID: string;
}

export interface IShare {
	id: string;
	name: string;
	userID: string;
}

export interface IUserData {
	user: {
		shares: IShare[];
		id: string;
		name: string;
		emails: string[];
	};
}

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
}

export interface IBaseSongPlayable extends IBaseSong {
	getMediaURL: () => Promise<string>;
}

export interface IShareSong extends IBaseSong {
	requiresUserAction: boolean;
}

export interface IPlaylistSong extends IBaseSong {
	playlistID: string;
	position: number;
	dateAdded: string;
}

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
`;

export const shareSongKeys = `
	${baseSongKeys}
`;

export const playlistSongKeys = `
	${baseSongKeys}
`;

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
