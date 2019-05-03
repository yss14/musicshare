import { Playlist } from "../models/PlaylistModel";
import { Resolver, Authorized, FieldResolver, Root, Arg, Mutation } from "type-graphql";
import { IPlaylistService, OrderUpdate } from "../services/PlaylistService";
import { PlaylistSong } from "../models/SongModel";
import { OrderUpdateScalar } from "../types/scalars/order-update";

@Resolver(of => Playlist)
export class PlaylistResolver {
	constructor(
		private readonly playlistService: IPlaylistService,
	) { }

	@Authorized()
	@FieldResolver(() => [PlaylistSong])
	public async songs(
		@Root() playlist: Playlist,
	): Promise<PlaylistSong[]> {
		return this.playlistService.getSongs(playlist.id);
	}

	@Authorized()
	@Mutation(() => Playlist, { nullable: true })
	public async createPlaylist(
		@Arg('shareID') shareID: string,
		@Arg('name') name: string,
	): Promise<Playlist | null> {
		return this.playlistService.create(shareID, name);
	}

	@Authorized()
	@Mutation(() => Boolean)
	public async deletePlaylist(
		@Arg('playlistID') playlistID: string,
	): Promise<boolean> {
		await this.playlistService.delete(playlistID);

		return true;
	}

	@Authorized()
	@Mutation(() => Playlist, { nullable: true })
	public async renamePlaylist(
		@Arg('playlistID') playlistID: string,
		@Arg('newName') newName: string,
	): Promise<null> {
		if (newName.trim().length < 2) {
			throw new Error('Name has to be of min length 2');
		}

		await this.playlistService.rename(playlistID, newName);

		return null;
	}

	@Authorized()
	@Mutation(() => [PlaylistSong])
	public async addSongsToPlaylist(
		@Arg('shareID') shareID: string,
		@Arg('playlistID') playlistID: string,
		@Arg('songIDs', () => [String]) songIDs: string[],
	): Promise<PlaylistSong[]> {
		await this.playlistService.addSongs(shareID, playlistID, songIDs);

		return this.playlistService.getSongs(playlistID);
	}

	@Authorized()
	@Mutation(() => [PlaylistSong])
	public async updateOrderOfPlaylist(
		@Arg('playlistID') playlistID: string,
		@Arg('orderUpdates', () => [OrderUpdateScalar]) orderUpdates: OrderUpdate[],
	): Promise<PlaylistSong[]> {
		await this.playlistService.updateOrder(playlistID, orderUpdates);

		return this.playlistService.getSongs(playlistID);
	}
}