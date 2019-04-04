export interface ISongTypeWithoutGroup {
	name: string;
	hasArtists: boolean;
	alternativeNames?: string[];
}

export interface ISongType extends ISongTypeWithoutGroup {
	group: string;
}