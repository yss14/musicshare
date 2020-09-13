import { Resolver, Query, Arg, FieldResolver, Root, Authorized, Args, Ctx, Mutation } from "type-graphql"
import { Share } from "../models/ShareModel"
import { ShareSong } from "../models/SongModel"
import { Playlist } from "../models/PlaylistModel"
import { PlaylistIDArg } from "../args/playlist-args"
import { ShareAuth } from "../auth/middleware/share-auth"
import { IGraphQLContext } from "../types/context"
import { IServices } from "../services/services"
import { ShareNameArg, ShareIDArg } from "../args/share-args"
import { InviteToShareInput } from "../inputs/InviteToShareInput"
import { ForbiddenError } from "apollo-server-core"
import { UserNotFoundError } from "../services/UserService"
import { Permissions, ITimedstampedResults } from "@musicshare/shared-types"
import { ShareMember } from "../models/UserModel"
import { AcceptInvitationInput } from "../inputs/AcceptInvitationInput"
import { RevokeInvitationInput } from "../inputs/RevokeInvitationInput"
import { ShareIDInput } from "../inputs/ShareIDInput"
import { TimestampedResults } from "../models/helper/TimestampedResultModel"
import { TimestampArgs } from "../args/pagination-args"
import { RegistrationSuccess } from "../models/return-models/RegistrationSuccess"

const TimedstampSongResult = TimestampedResults(ShareSong)

@Resolver(() => Share)
export class ShareResolver {
	constructor(private readonly services: IServices) {}

	@Authorized()
	@ShareAuth({ checkRef: true })
	@Query(() => Share)
	public share(@Arg("shareID") shareID: string, @Ctx() ctx: IGraphQLContext): Promise<Share> {
		return this.services.shareService.getShareByID(shareID, ctx.userID!)
	}

	@Authorized()
	@FieldResolver(() => [ShareSong])
	public async songs(
		@Root() share: Share,
		@Arg("from", { nullable: true }) from?: number,
		@Arg("take", { nullable: true }) take?: number,
	): Promise<ShareSong[]> {
		const songs = await this.services.songService.getByShare(share.id)

		const startIdx = (from || 1) - 1
		const endIdx = (take || songs.length) - 1

		return songs.filter((_, idx) => idx >= startIdx && idx <= endIdx)
	}

	@Authorized()
	@FieldResolver(() => TimedstampSongResult)
	public async songsDirty(
		@Root() share: Share,
		@Args() { lastTimestamp }: TimestampArgs,
	): Promise<ITimedstampedResults<ShareSong>> {
		const dirtySongs = await this.services.songService.getByShareDirty(share.id, lastTimestamp.getTime())
		const time = new Date()

		return {
			nodes: dirtySongs,
			timestamp: time,
		}
	}

	@Authorized()
	@FieldResolver(() => ShareSong)
	public song(@Root() share: Share, @Arg("id") id: string): Promise<ShareSong | null> {
		return this.services.songService.getByID(share.id, id)
	}

	@Authorized()
	@FieldResolver(() => [Playlist])
	public async playlists(@Root() share: Share): Promise<Playlist[]> {
		return this.services.playlistService.getPlaylistsForShare(share.id)
	}

	@Authorized()
	@FieldResolver(() => Playlist)
	public async playlist(@Root() share: Share, @Args() { playlistID }: PlaylistIDArg): Promise<Playlist> {
		return this.services.playlistService.getByID(share.id, playlistID)
	}

	@Authorized()
	@FieldResolver(() => [ShareMember])
	public async members(@Root() share: Share): Promise<ShareMember[]> {
		return this.services.userService.getMembersOfShare(share.id)
	}

	@Authorized()
	@FieldResolver(() => [String])
	public async permissions(): Promise<string[]> {
		return this.services.permissionService.getAvailablePermissions()
	}

	@Authorized()
	@FieldResolver(() => [String])
	public async userPermissions(@Root() share: Share, @Ctx() ctx: IGraphQLContext): Promise<string[]> {
		return this.services.permissionService.getPermissionsForUser(share.id.toString(), ctx.userID!)
	}

	@Authorized()
	@Mutation(() => Share)
	public async createShare(@Args() { name }: ShareNameArg, @Ctx() ctx: IGraphQLContext): Promise<Share> {
		const createdShare = await this.services.shareService.create(ctx.userID!, name, false)

		return createdShare
	}

	@Authorized()
	@ShareAuth({ permissions: ["share:owner"] })
	@Mutation(() => Share)
	public async renameShare(
		@Args() { shareID }: ShareIDArg,
		@Args() { name }: ShareNameArg,
		@Ctx() ctx: IGraphQLContext,
	): Promise<Share> {
		await this.services.shareService.rename(shareID, name)

		return this.services.shareService.getShareByID(shareID, ctx.userID!)
	}

	@Authorized()
	@ShareAuth({ permissions: ["share:owner"] })
	@Mutation(() => Boolean)
	public async deleteShare(@Args() { shareID }: ShareIDArg): Promise<boolean> {
		await this.services.shareService.remove(shareID)

		return true
	}

	@Authorized()
	@ShareAuth({ permissions: ["share:owner"] })
	@Mutation(() => String, {
		nullable: true,
		description: "Returns an invitation link or null if user already existed and has been added to the share",
	})
	public async inviteToShare(
		@Arg("input") { shareID, email }: InviteToShareInput,
		@Ctx() { userID, share }: IGraphQLContext,
	): Promise<string | null> {
		if (!share || share.isLibrary === true) {
			throw new ForbiddenError("Invitations to user libraries is not possible")
		}

		try {
			const user = await this.services.userService.getUserByEMail(email)
			const userShares = await this.services.shareService.getSharesOfUser(user.id)

			if (userShares.some((share) => share.id === shareID)) {
				throw new ForbiddenError("User already member of share")
			}

			const userLibrary = userShares.find((share) => share.isLibrary)!
			await this.services.shareService.addUser(shareID, user.id, Permissions.NEW_MEMBER)
			await this.services.songService.addLibrarySongsToShare(shareID, userLibrary.id)

			return null
		} catch (err) {
			if (!(err instanceof UserNotFoundError)) throw err
		}

		const { invitationLink } = await this.services.userService.inviteToShare(shareID, userID!, email)

		return invitationLink
	}

	@Mutation(() => RegistrationSuccess)
	public async acceptInvitation(
		@Arg("input") { invitationToken, name, password }: AcceptInvitationInput,
	): Promise<RegistrationSuccess> {
		const user = await this.services.userService.acceptInvitation(invitationToken, name, password)
		const restoreToken = await this.services.passwordLoginService.getRestoreToken(user.id)

		return { restoreToken, user }
	}

	@Mutation(() => Boolean)
	@ShareAuth({ permissions: ["share:owner"] })
	public async revokeInvitation(@Arg("input") { shareID, userID }: RevokeInvitationInput): Promise<boolean> {
		await this.services.userService.revokeInvitation(shareID, userID)

		return true
	}

	@Mutation(() => Boolean)
	@ShareAuth()
	public async leaveShare(
		@Arg("input") { shareID }: ShareIDInput,
		@Ctx() { userID }: IGraphQLContext,
	): Promise<boolean> {
		await this.services.shareService.removeUser(shareID, userID!)

		return true
	}
}
