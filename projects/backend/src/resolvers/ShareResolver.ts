import { Resolver, Query, Arg, FieldResolver, Root, Authorized, Args, Ctx, Mutation } from "type-graphql";
import { Share } from "../models/ShareModel";
import { Song } from "../models/SongModel";
import { Playlist } from '../models/PlaylistModel';
import { PlaylistIDArg } from '../args/playlist-args';
import { ShareAuth } from '../auth/middleware/share-auth';
import { IGraphQLContext } from '../types/context';
import { IServices } from '../services/services';
import { ShareNameArg, ShareIDArg } from "../args/share-args";
import { InviteToShareInput } from "../inputs/InviteToShareInput";
import { ForbiddenError } from "apollo-server-core";
import { UserNotFoundError } from "../services/UserService";
import { Permissions } from "../auth/permissions";
import { User } from "../models/UserModel";
import { AcceptInvitationInput } from "../inputs/AcceptInvitationInput";
import { RevokeInvitationInput } from "../inputs/RevokeInvitationInput";
import { expireAuthToken } from "../auth/auth-middleware";

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
	@FieldResolver(() => [User])
	public async users(
		@Root() share: Share,
	): Promise<User[]> {
		return this.services.userService.getUsersOfShare(share.id);
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
		const createdShare = await this.services.shareService.create(ctx.userID!, name, false)
		await expireAuthToken(ctx)

		return createdShare
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
		@Ctx() ctx: IGraphQLContext,
	): Promise<boolean> {
		await this.services.shareService.delete(shareID)
		await expireAuthToken(ctx)

		return true
	}

	@Authorized()
	@ShareAuth({ permissions: ["share:owner"] })
	@Mutation(() => String, { nullable: true, description: 'Returns an invitation link or null if user already existed and has been added to the share' })
	public async inviteToShare(
		@Arg('input') { shareID, email }: InviteToShareInput,
		@Ctx() { userID, share }: IGraphQLContext,
	): Promise<string | null> {
		if (!share || share.isLibrary === true) {
			throw new ForbiddenError('Invitations to user libraries is not possible')
		}

		try {
			const user = await this.services.userService.getUserByEMail(email)
			const userShares = await this.services.shareService.getSharesOfUser(user.id)

			if (userShares.some(share => share.id === shareID)) {
				throw new ForbiddenError('User already member of share')
			}

			await this.services.shareService.addUser(shareID, user.id, Permissions.NEW_MEMBER)

			return null
		} catch (err) {
			if (!(err instanceof UserNotFoundError)) throw err
		}

		const { invitationLink } = await this.services.userService.inviteToShare(shareID, userID!, email)

		return invitationLink
	}

	@Mutation(() => User)
	public async acceptInvitation(
		@Arg('input') { invitationToken, name, password }: AcceptInvitationInput,
	): Promise<User> {
		return await this.services.userService.acceptInvitation(invitationToken, name, password)
	}

	@Mutation(() => Boolean)
	@ShareAuth({ permissions: ["share:owner"] })
	public async revokeInvitation(
		@Arg('input') { userID }: RevokeInvitationInput,
	): Promise<boolean> {
		await this.services.userService.revokeInvitation(userID)

		return true
	}
}