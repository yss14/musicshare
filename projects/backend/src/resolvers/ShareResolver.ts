import { SongService } from '../services/SongService';
import { Resolver, Query, Arg, FieldResolver, Root } from "type-graphql";
import { Share } from "../models/ShareModel";
import { Song } from "../models/SongModel";
import { ShareService } from "../services/ShareService";
import { Inject } from 'typedi';

@Resolver(of => Share)
export class ShareResolver {
	constructor(
		@Inject('SHARE_SERVICE') private readonly shareService: ShareService,
		@Inject('SONG_SERVICE') private readonly songService: SongService,
	) { }

	@Query(returns => Share, { nullable: true })
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
	public async song(
		@Root() share: Share,
		@Arg('id') id: string
	): Promise<Song | null> {
		return await this.songService.getByID(share.id, id);
	}
}