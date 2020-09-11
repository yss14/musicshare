export interface ISongTypeWithoutGroup {
	id: string
	name: string
	hasArtists: boolean
	alternativeNames?: string[]
}

export interface ISongType extends ISongTypeWithoutGroup {
	group: string
}

export type ISongTypeWithoutID = Omit<ISongType, "id">
