export interface IGenre {
	id: string
	name: string
	group: string
}

export type IGenreWithoutID = Omit<IGenre, "id">
