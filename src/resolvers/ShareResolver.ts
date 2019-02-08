import { SongService } from '../services/song.service';
import { Resolver, Query, Arg, FieldResolver, Root } from "type-graphql";
import { Share } from "../models/share.model";
import { Song } from "../models/song.model";
import { ShareService } from "../services/share.service";

@Resolver(of => Share)
export class ShareResolver {
	constructor(
		private readonly shareService: ShareService,
		private readonly songService: SongService,
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

		const startIdx = from || 0;

		return songs.slice(startIdx, take === undefined ? songs.length - startIdx : take);
	}

	@FieldResolver()
	public async song(
		@Root() share: Share,
		@Arg('id') id: string
	): Promise<Song> {
		return await this.songService.getByID(share.id, id);
	}
}