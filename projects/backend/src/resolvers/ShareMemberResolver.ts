import { Resolver, Authorized, Mutation, Args } from "type-graphql"
import { ShareMember } from "../models/UserModel"
import { IServices } from "../services/services"
import { ShareAuth } from "../auth/middleware/share-auth"
import { UserIDArg, PermissionsArg } from "../args/user-args"
import { ShareIDArg } from "../args/share-args"

@Resolver(() => ShareMember)
export class ShareMemberResolver {
	constructor(private readonly services: IServices) {}

	@Authorized()
	@ShareAuth({ permissions: ["share:owner"] })
	@Mutation(() => ShareMember, {
		description: "Updates permissions of a user and returns the updated permission list",
	})
	public async updateShareMemberPermissions(
		@Args() { userID }: UserIDArg,
		@Args() { shareID }: ShareIDArg,
		@Args() { permissions }: PermissionsArg,
	): Promise<ShareMember> {
		await this.services.permissionService.addPermissionsForUser(shareID, userID, permissions)

		return this.services.userService.getMemberOfShare(shareID, userID)
	}
}
