import { Resolver, Query, Arg, FieldResolver, Root, Authorized, Args, Ctx, Mutation } from "type-graphql";
import { Share } from "../models/ShareModel";
import { Song } from "../models/SongModel";
import { Playlist } from '../models/PlaylistModel';
import { PlaylistIDArg } from '../args/playlist-args';
import { ShareAuth } from '../auth/middleware/share-auth';
import { IGraphQLContext } from '../types/context';
import { IServices } from '../services/services';
import { ShareNameArg, ShareIDArg } from "../args/share-args";

@Resolver(of => Share)
export class ShareResolver {
	constructor(
		private readonly services: IServices,
	) { }

	@Authorized()
	@ShareAuth({ checkRef: true })
	@Query(() => Share)
	public share(
		@Arg("shareID") shareID: string,
		@Ctx() ctx: IGraphQLContext,
	): Promise<Share> {
		return this.services.shareService.getShareByID(shareID, ctx.userID!);
	}

	@Authorized()
	@FieldResolver()
	public async songs(
		@Root() share: Share,
		@Arg('from', { nullable: true }) from?: number,
		@Arg('take', { nullable: true }) take?: number
	): Promise<Song[]> {
		const songs = await this.services.songService.getByShare(share);

		const startIdx = (from || 1) - 1;
		const endIdx = (take || songs.length) - 1;

		return songs.filter((_, idx) => idx >= startIdx && idx <= endIdx);
	}

	@Authorized()
	@FieldResolver(() => [Song])
	public async songsDirty(
		@Root() share: Share,
		@Arg('lastTimestamp') lastTimestamp: number,
	): Promise<Song[]> {
		return this.services.songService.getByShareDirty(share.id, lastTimestamp);
	}

	@Authorized()
	@FieldResolver()
	public song(
		@Root() share: Share,
		@Arg('id') id: string
	): Promise<Song | null> {
		return this.services.songService.getByID(share, id);
	}

	@Authorized()
	@FieldResolver(() => [Playlist])
	public async playlists(
		@Root() share: Share,
	): Promise<Playlist[]> {
		return this.services.playlistService.getPlaylistsForShare(share.id);
	}

	@Authorized()
	@FieldResolver(() => Playlist)
	public async playlist(
		@Root() share: Share,
		@Args() { playlistID }: PlaylistIDArg,
	): Promise<Playlist> {
		return this.services.playlistService.getByID(share.id, playlistID);
	}

	@Authorized()
	@FieldResolver(() => [String])
	public async permissions(
		@Root() share: Share
	): Promise<string[]> {
		return this.services.permissionService.getAvailablePermissions();
	}

	@Authorized()
	@FieldResolver(() => [String])
	public async userPermissions(
		@Root() share: Share,
		@Ctx() ctx: IGraphQLContext,
	): Promise<string[]> {
		return this.services.permissionService.getPermissionsForUser(share.id.toString(), ctx.userID!);
	}

	@Authorized()
	@Mutation(() => Share)
	public async createShare(
		@Args() { name }: ShareNameArg,
		@Ctx() ctx: IGraphQLContext
	): Promise<Share> {
		return this.services.shareService.create(ctx.userID!, name, false);
	}

	@Authorized()
	@ShareAuth({ permissions: ["share:owner"] })
	@Mutation(() => Share)
	public async renameShare(
		@Args() { shareID }: ShareIDArg,
		@Args() { name }: ShareNameArg,
		@Ctx() ctx: IGraphQLContext
	): Promise<Share> {
		await this.services.shareService.rename(shareID, name)

		return this.services.shareService.getShareByID(shareID, ctx.userID!)
	}

	@Authorized()
	@ShareAuth({ permissions: ["share:owner"] })
	@Mutation(() => Boolean)
	public async deleteShare(
		@Args() { shareID }: ShareIDArg,
	): Promise<boolean> {
		await this.services.shareService.delete(shareID)

		return true
	}
}