import { IDatabaseClient } from "postgres-schema-builder";
import { IServices } from "./services";
import { defaultSongTypes, defaultGenres } from "../database/fixtures";
import { SongType } from "../models/SongType";
import { Genre } from "../models/GenreModel";

export type ISeedService = ReturnType<typeof SeedService>

export const SeedService = (database: IDatabaseClient, services: IServices) => {
	const { songTypeService, genreService } = services

	const seedShare = async (shareID: string) => {
		await Promise.all(defaultSongTypes.map(songType =>
			songTypeService.addSongTypeToShare(shareID, SongType.fromObject(songType))));

		await Promise.all(defaultGenres.map(genre =>
			genreService.addGenreToShare(shareID, Genre.fromObject(genre))));
	}

	return {
		seedShare,
	}
}