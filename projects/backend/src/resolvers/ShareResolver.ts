import { ISongService } from '../services/SongService';
import { Resolver, Query, Arg, FieldResolver, Root, Authorized, Args, Ctx } from "type-graphql";
import { Share } from "../models/ShareModel";
import { ShareSong } from "../models/SongModel";
import { IShareService } from "../services/ShareService";
import { ISongTypeService } from '../services/SongTypeService';
import { SongType } from '../models/SongType';
import { Genre } from '../models/GenreModel';
import { IGenreService } from '../services/GenreService';
import { IArtistService } from '../services/ArtistService';
import { Artist } from '../models/ArtistModel';
import { Playlist } from '../models/PlaylistModel';
import { IPlaylistService } from '../services/PlaylistService';
import { PlaylistIDArg } from '../args/playlist-args';
import { ShareAuth } from '../auth/middleware/share-auth';
import { IGraphQLContext } from '../types/context';

@Resolver(of => Share)
export class ShareResolver {
	constructor(
		private readonly shareService: IShareService,
		private readonly songService: ISongService,
		private readonly songTypeService: ISongTypeService,
		private readonly genreService: IGenreService,
		private readonly artistService: IArtistService,
		private readonly playlistService: IPlaylistService,
	) { }

	@Authorized()
	@ShareAuth({ checkRef: true })
	@Query(() => Share)
	public share(
		@Arg("shareID") shareID: string,
		@Ctx() ctx: IGraphQLContext,
	): Promise<Share> {
		return this.shareService.getShareByID(shareID, ctx.userID!);
	}

	@Authorized()
	@FieldResolver()
	public async songs(
		@Root() share: Share,
		@Arg('from', { nullable: true }) from?: number,
		@Arg('take', { nullable: true }) take?: number
	): Promise<ShareSong[]> {
		const songs = await this.songService.getByShare(share.id);

		const startIdx = (from || 1) - 1;
		const endIdx = (take || songs.length) - 1;

		return songs.filter((_, idx) => idx >= startIdx && idx <= endIdx);
	}

	@Authorized()
	@FieldResolver(() => [ShareSong])
	public async songsDirty(
		@Root() share: Share,
		@Arg('lastTimestamp') lastTimestamp: number,
	): Promise<ShareSong[]> {
		return this.songService.getByShareDirty(share.id, lastTimestamp);
	}

	@Authorized()
	@FieldResolver()
	public song(
		@Root() share: Share,
		@Arg('id') id: string
	): Promise<ShareSong | null> {
		return this.songService.getByID(share.id, id);
	}

	@Authorized()
	@FieldResolver(() => [SongType])
	public async songTypes(
		@Root() share: Share
	): Promise<SongType[]> {
		return this.songTypeService.getSongTypesForShare(share.id);
	}

	@Authorized()
	@FieldResolver(() => [Genre])
	public async genres(
		@Root() share: Share
	): Promise<Genre[]> {
		return this.genreService.getGenresForShare(share.id);
	}

	@Authorized()
	@FieldResolver(() => [Artist])
	public async artists(
		@Root() share: Share
	): Promise<Artist[]> {
		return this.artistService.getArtistsForShare(share.id);
	}

	@Authorized()
	@FieldResolver(() => [Playlist])
	public async playlists(
		@Root() share: Share,
	): Promise<Playlist[]> {
		return this.playlistService.getPlaylistsForShare(share.id);
	}

	@Authorized()
	@FieldResolver(() => Playlist)
	public async playlist(
		@Root() share: Share,
		@Args() { playlistID }: PlaylistIDArg,
	): Promise<Playlist> {
		return this.playlistService.getByID(share.id, playlistID);
	}
}