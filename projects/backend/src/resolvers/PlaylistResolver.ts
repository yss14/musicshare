import { Playlist } from "../models/PlaylistModel";
import { Resolver, Authorized, FieldResolver, Root, Arg, Mutation, Args } from "type-graphql";
import { IPlaylistService, OrderUpdate } from "../services/PlaylistService";
import { PlaylistSong } from "../models/SongModel";
import { OrderUpdateScalar } from "../types/scalars/order-update";
import { PlaylistNameArg, PlaylistIDArg, PlaylistNewNameArg } from "../args/playlist-args";
import { ShareIDArg } from "../args/share-args";
import { SongIDsArg } from "../args/song-args";
import { sortBy } from 'lodash';
import { PlaylistAuth } from "../auth/auth-middleware";

@Resolver(of => Playlist)
export class PlaylistResolver {
	constructor(
		private readonly playlistService: IPlaylistService,
	) { }

	@Authorized()
	@PlaylistAuth()
	@FieldResolver(() => [PlaylistSong])
	public async songs(
		@Root() playlist: Playlist,
	): Promise<PlaylistSong[]> {
		return this.playlistService.getSongs(playlist.id);
	}

	@Authorized()
	@PlaylistAuth(['create'])
	@Mutation(() => Playlist, { nullable: true })
	public async createPlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { name }: PlaylistNameArg,
	): Promise<Playlist | null> {
		return this.playlistService.create(shareID, name);
	}

	@Authorized()
	@PlaylistAuth(['modify'])
	@Mutation(() => Boolean, { description: 'Deletes an existing playlists. Does not check if playlist exists.' })
	public async deletePlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
	): Promise<boolean> {
		await this.playlistService.delete(shareID, playlistID);

		return true;
	}

	@Authorized()
	@PlaylistAuth(['modify'])
	@Mutation(() => Boolean, { description: 'Renames an existing playlists. Does not check if playlist exists.' })
	public async renamePlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
		@Args() { newName }: PlaylistNewNameArg,
	): Promise<boolean> {
		await this.playlistService.rename(shareID, playlistID, newName);

		return true;
	}

	@Authorized()
	@PlaylistAuth(['mutate_songs'])
	@Mutation(() => [PlaylistSong])
	public async addSongsToPlaylist(
		@Args() { shareID }: ShareIDArg,
		@Args() { playlistID }: PlaylistIDArg,
		@Args() { songIDs }: SongIDsArg,
	): Promise<PlaylistSong[]> {
		await this.playlistService.addSongs(shareID, playlistID, songIDs);

		return this.playlistService.getSongs(playlistID);
	}

	@Authorized()
	@PlaylistAuth(['mutate_songs'])
	@Mutation(() => [PlaylistSong])
	public async removeSongsFromPlaylist(
		@Args() { playlistID }: PlaylistIDArg,
		@Args() { songIDs }: SongIDsArg,
	): Promise<PlaylistSong[]> {
		await this.playlistService.removeSongs(playlistID, songIDs);

		return this.playlistService.getSongs(playlistID);
	}

	@Authorized()
	@PlaylistAuth(['mutate_songs'])
	@Mutation(() => [PlaylistSong])
	public async updateOrderOfPlaylist(
		@Args() { playlistID }: PlaylistIDArg,
		@Arg('orderUpdates', () => [OrderUpdateScalar]) orderUpdates: OrderUpdate[],
	): Promise<PlaylistSong[]> {
		await this.playlistService.updateOrder(playlistID, orderUpdates);

		const playlistSongs = await this.playlistService.getSongs(playlistID);

		return sortBy(playlistSongs, 'position');
	}
}