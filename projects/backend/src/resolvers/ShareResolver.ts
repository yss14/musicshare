import { ISongService } from '../services/SongService';
import { Resolver, Query, Arg, FieldResolver, Root } from "type-graphql";
import { Share } from "../models/ShareModel";
import { Song } from "../models/SongModel";
import { IShareService } from "../services/ShareService";
import { Inject } from 'typedi';
import { ISongTypeService } from '../services/SongTypeService';
import { SongType } from '../models/SongType';
import { Genre } from '../models/GenreModel';
import { IGenreService } from '../services/GenreService';

@Resolver(of => Share)
export class ShareResolver {
	constructor(
		@Inject('SHARE_SERVICE') private readonly shareService: IShareService,
		@Inject('SONG_SERVICE') private readonly songService: ISongService,
		@Inject('SONG_TYPE_SERVICE') private readonly songTypeService: ISongTypeService,
		@Inject('GENRE_SERVICE') private readonly genreService: IGenreService,
	) { }

	@Query(() => Share, { nullable: true })
	public share(@Arg("id") id: string): Promise<Share | null> {
		return this.shareService.getShareByID(id);
	}

	@FieldResolver()
	public async songs(
		@Root() share: Share,
		@Arg('from', { nullable: true }) from?: number,
		@Arg('take', { nullable: true }) take?: number
	): Promise<Song[]> {
		const songs = await this.songService.getByShare(share);

		const startIdx = (from || 1) - 1;
		const endIdx = (take || songs.length) - 1;

		return songs.filter((_, idx) => idx >= startIdx && idx <= endIdx);
	}

	@FieldResolver()
	public song(
		@Root() share: Share,
		@Arg('id') id: string
	): Promise<Song | null> {
		return this.songService.getByID(share.id, id);
	}

	@FieldResolver(() => [SongType])
	public async songTypes(
		@Root() share: Share
	): Promise<SongType[]> {
		const songTypes = await this.songTypeService.getSongTypesForShare(share.id);

		return songTypes;
	}

	@FieldResolver(() => [Genre])
	public async genres(
		@Root() share: Share
	): Promise<Genre[]> {
		const genres = await this.genreService.getGenresForShare(share.id);

		return genres;
	}
}