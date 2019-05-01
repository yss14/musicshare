import { Playlist } from "../models/PlaylistModel";
import { Resolver, Authorized, FieldResolver, Root } from "type-graphql";
import { IPlaylistService } from "../services/PlaylistService";
import { Song } from "../models/SongModel";

@Resolver(of => Playlist)
export class PlaylistResolver {
	constructor(
		private readonly playlistService: IPlaylistService,
	) { }

	@Authorized()
	@FieldResolver(() => [Song])
	public async songs(
		@Root() playlist: Playlist,
	): Promise<Song[]> {
		return this.playlistService.getSongs(playlist.id);
	}
}