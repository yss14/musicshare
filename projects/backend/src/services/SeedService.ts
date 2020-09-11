import { IDatabaseClient } from "postgres-schema-builder"
import { ServiceFactory } from "./services"
import { defaultSongTypes, defaultGenres } from "../database/fixtures"
import { SongType } from "../models/SongType"
import { Genre } from "../models/GenreModel"

export type ISeedService = ReturnType<typeof SeedService>

export const SeedService = (database: IDatabaseClient, services: ServiceFactory) => {
	const seedShare = async (shareID: string) => {
		const { songTypeService, genreService } = services()

		await Promise.all(defaultSongTypes.map((songType) => songTypeService.addSongTypeToShare(shareID, songType)))

		await Promise.all(defaultGenres.map((genre) => genreService.addGenreToShare(shareID, genre)))
	}

	return {
		seedShare,
	}
}
