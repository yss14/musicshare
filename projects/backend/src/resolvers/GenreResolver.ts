import { Resolver, Authorized, Mutation, Args, Ctx } from "type-graphql"
import { IServices } from "../services/services"
import { IGraphQLContext } from "../types/context"
import { Genre } from "../models/GenreModel"
import { CreateGenreInput, UpdateGenreInput, RemoveGenreInput } from "../inputs/GenreInput"

@Resolver(() => Genre)
export class GenreResolver {
	constructor(private readonly services: IServices) {}

	@Authorized()
	@Mutation(() => Genre, { nullable: true })
	public async addGenre(
		@Ctx() { library }: IGraphQLContext,
		@Args() payload: CreateGenreInput,
	): Promise<Genre | null> {
		return this.services.genreService.addGenreToShare(library!.id, payload)
	}

	@Authorized()
	@Mutation(() => Genre, { nullable: true })
	public async updateGenre(
		@Ctx() { library }: IGraphQLContext,
		@Args() { genreID, ...payload }: UpdateGenreInput,
	): Promise<Genre | null> {
		await this.services.genreService.updateGenreOfShare(library!.id, genreID, payload)

		return this.services.genreService.getGenreForShare(library!.id, genreID)
	}

	@Authorized()
	@Mutation(() => Boolean)
	public async removeGenre(
		@Ctx() { library }: IGraphQLContext,
		@Args() { genreID }: RemoveGenreInput,
	): Promise<Boolean> {
		await this.services.genreService.getGenreForShare(library!.id, genreID)
		await this.services.genreService.removeGenreFromShare(library!.id, genreID)

		return true
	}
}
