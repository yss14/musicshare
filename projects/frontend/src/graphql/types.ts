export interface ITodoVariables {
	id: string;
}

export interface IEmailVariables {
	id: string;
	email: string;
}

export interface IVisibilityVariables {
	visibilityFilter: string;
}

export interface IShareVariables {
	shareId: string;
}

export interface IShareData {
	shareId: string;
}

export interface IUserData {
	user: {
		shares: {
			id: string;
			name: string;
			userID: string;
		}[];
		id: string;
		name: string;
		emails: string[];
	};
}

export interface IUserVariables {
	id: string;
}

export interface IShareSong {
	id: string;
	title: string;
	suffix: string | null;
	year: number | null;
	bpm: number | null;
	dateLastEdit: number;
	releaseDate: string | null;
	isRip: boolean;
	artists: string[];
	remixer: string[];
	featurings: string[];
	type: string | null;
	genres: string[];
	label: string;
	duration: number;
	requiresUserAction: boolean;
	tags: string[];
}

export const shareSongKeys = `
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
	label
	requiresUserAction,
	tags
`;

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