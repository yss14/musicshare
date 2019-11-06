import { Playlist } from "../models/PlaylistModel";
import { Resolver, Authorized, FieldResolver, Root, Arg, Mutation, Args, Ctx } from "type-graphql";
import { OrderUpdate } from "../services/PlaylistService";
import { Song } from "../models/SongModel";
import { OrderUpdateScalar } from "../types/scalars/order-update";
import { PlaylistNameArg, PlaylistIDArg, PlaylistNewNameArg } from "../args/playlist-args";
import { ShareIDArg } from "../args/share-args";
import { SongIDsArg } from "../args/song-args";
import { PlaylistAuth } from "../auth/middleware/playlist-auth";
import { IServices } from "../services/services";
import { IGraphQLContext } from "../types/context";
import { ForbiddenError } from "apollo-server-core";

@Resolver(of => Playlist)
export class PlaylistResolver {
	constructor(
		private readonly services: IServices,
	) { }

	@Authorized()
	@PlaylistAuth()
	@FieldResolver(() => [Song])
	public async songs(
		@Root() playlist: Playlist,
	): Promise<Song[]> {
		return this.services.playlistService.getSongs(playlist.id);
	}

	@Authorized()
	@PlaylistAuth({ permissions: ['playlist:create'], checkRef: false })
	@Mutation(() => Playlist, { nullable: true })
	public async createPlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { name }: PlaylistNameArg,
	): Promise<Playlist | null> {
		return this.services.playlistService.create(shareID, name);
	}

	@Authorized()
	@PlaylistAuth(['playlist:modify'])
	@Mutation(() => Boolean, { description: 'Deletes an existing playlists. Does not check if playlist exists.' })
	public async deletePlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
	): Promise<boolean> {
		await this.services.playlistService.delete(shareID, playlistID);

		return true;
	}

	@Authorized()
	@PlaylistAuth(['playlist:modify'])
	@Mutation(() => Boolean, { description: 'Renames an existing playlists. Does not check if playlist exists.' })
	public async renamePlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
		@Args() { newName }: PlaylistNewNameArg,
	): Promise<boolean> {
		await this.services.playlistService.rename(shareID, playlistID, newName);

		return true;
	}

	@Authorized()
	@PlaylistAuth(['playlist:mutate_songs'])
	@Mutation(() => [Song])
	public async addSongsToPlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
		@Args() { songIDs }: SongIDsArg,
		@Ctx() { userID }: IGraphQLContext,
	): Promise<Song[]> {
		if (!(await this.services.songService.hasAccessToSongs(userID!, songIDs))) {
			throw new ForbiddenError('User has no permission to add those song ids to a playlist')
		}

		await this.services.playlistService.addSongs(shareID, playlistID, songIDs);

		return this.services.playlistService.getSongs(playlistID);
	}

	@Authorized()
	@PlaylistAuth(['playlist:mutate_songs'])
	@Mutation(() => [Song])
	public async removeSongsFromPlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
		@Args() { songIDs }: SongIDsArg,
	): Promise<Song[]> {
		await this.services.playlistService.removeSongs(shareID, playlistID, songIDs);

		return this.services.playlistService.getSongs(playlistID);
	}

	@Authorized()
	@PlaylistAuth(['playlist:mutate_songs'])
	@Mutation(() => [Song])
	public async updateOrderOfPlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
		@Arg('orderUpdates', () => [OrderUpdateScalar]) orderUpdates: OrderUpdate[],
	): Promise<Song[]> {
		await this.services.playlistService.updateOrder(shareID, playlistID, orderUpdates);

		const playlistSongs = await this.services.playlistService.getSongs(playlistID);

		return playlistSongs;
	}
}