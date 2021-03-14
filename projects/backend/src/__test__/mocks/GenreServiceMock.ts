import { defaultGenres } from "../../database/fixtures"
import { Genre } from "../../models/GenreModel"
import { IGenreService } from "../../services/GenreService"
import { v4 as uuid } from "uuid"

export const GenreServiceMock = (): IGenreService => ({
	getGenreForShare: jest.fn(),
	getGenresForShare: async () => defaultGenres.map((genre) => Genre.fromObject({ id: uuid(), ...genre })),
	getGenresForShares: async () => defaultGenres.map((genre) => Genre.fromObject({ id: uuid(), ...genre })),
	addGenreToShare: jest.fn(),
	getAggregatedGenresForUser: async () => defaultGenres.map((genre) => Genre.fromObject({ id: uuid(), ...genre })),
	removeGenreFromShare: jest.fn(),
	updateGenreOfShare: jest.fn(),
})
