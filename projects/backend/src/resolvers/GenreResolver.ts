import { Resolver, Authorized, Mutation, Args, Ctx } from "type-graphql"
import { IServices } from "../services/services"
import { IGraphQLContext } from "../types/context"
import { Genre } from "../models/GenreModel"
import { CreateGenreInput, UpdateGenreInput } from "../inputs/GenreInput"

@Resolver(() => Genre)
export class GenreResolver {
	constructor(private readonly services: IServices) {}

	@Authorized()
	@Mutation(() => Genre, { nullable: true })
	public async addGenre(
		@Ctx() { library }: IGraphQLContext,
		@Args() { group, name }: CreateGenreInput,
	): Promise<Genre | null> {
		return this.services.genreService.addGenreToShare(library!.id, { name, group })
	}

	@Authorized()
	@Mutation(() => Genre, { nullable: true })
	public async updateGenre(
		@Ctx() { library }: IGraphQLContext,
		@Args() { genreID, group, name }: UpdateGenreInput,
	): Promise<Genre | null> {
		await this.services.genreService.updateGenreOfShare(library!.id, genreID, { name, group })

		return this.services.genreService.getGenreForShare(library!.id, genreID)
	}
}
