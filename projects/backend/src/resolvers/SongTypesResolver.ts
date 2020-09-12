import { Resolver, Authorized, Mutation, Args, Ctx } from "type-graphql"
import { IServices } from "../services/services"
import { IGraphQLContext } from "../types/context"
import { SongType } from "../models/SongType"
import { CreateSongTypeInput, UpdateSongTypeInput, RemoveSongTypeInput } from "../inputs/SongTypeInput"

@Resolver(() => SongType)
export class SongTypeResolver {
	constructor(private readonly services: IServices) {}

	@Authorized()
	@Mutation(() => SongType, { nullable: true })
	public async addSongType(
		@Ctx() { library }: IGraphQLContext,
		@Args() payload: CreateSongTypeInput,
	): Promise<SongType | null> {
		return this.services.songTypeService.addSongTypeToShare(library!.id, payload)
	}

	@Authorized()
	@Mutation(() => SongType, { nullable: true })
	public async updateSongType(
		@Ctx() { library }: IGraphQLContext,
		@Args() { songTypeID, ...payload }: UpdateSongTypeInput,
	): Promise<SongType | null> {
		await this.services.songTypeService.updateSongTypeOfShare(library!.id, songTypeID, payload)

		return this.services.songTypeService.getSongTypeForShare(library!.id, songTypeID)
	}

	@Authorized()
	@Mutation(() => Boolean)
	public async removeSongType(
		@Ctx() { library }: IGraphQLContext,
		@Args() { songTypeID }: RemoveSongTypeInput,
	): Promise<Boolean> {
		await this.services.songTypeService.getSongTypeForShare(library!.id, songTypeID)
		await this.services.songTypeService.removeSongTypeFromShare(library!.id, songTypeID)

		return true
	}
}
