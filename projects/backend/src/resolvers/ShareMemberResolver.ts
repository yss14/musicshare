import { Resolver, FieldResolver, Root } from "type-graphql"
import { ShareMember } from "../models/UserModel"
import { IServices } from "../services/services"
import { PermissionAuth } from "../auth/middleware/permission-auth"
import { Permissions } from "@musicshare/shared-types/src"

@Resolver(() => ShareMember)
export class ShareMemberResolver {
	constructor(private readonly services: IServices) {}

	/*@PermissionAuth([Permissions.SHARE_OWNER])
	@FieldResolver(() => [String])
	public async permissions(@Root() shareMember: ShareMember): Promise<string[]> {
		return this.services.permissionService.getPermissionsForUser(shareMember.shareID, shareMember.id)
	}*/
}
