import { Share } from "./ShareModel"
import { ObjectType, Field, registerEnumType, InterfaceType } from "type-graphql"
import { IUserDBResult } from "../database/tables"
import { UserStatus } from "@musicshare/shared-types"
import { plainToClass } from "class-transformer"
import { PermissionAuth } from "../auth/middleware/permission-auth"
import { Permissions } from "@musicshare/shared-types"

registerEnumType(UserStatus, {
	name: "UserStatus",
	description: "Specifies whether a user already accepted an invitation or is still pending",
})

@InterfaceType()
export abstract class IUser {
	@Field()
	public readonly id!: string

	@Field()
	public readonly name!: string

	@Field()
	public readonly email!: string
}

@ObjectType({ description: "Object representing the viewer", implements: IUser })
export class Viewer extends IUser {
	@Field(() => UserStatus)
	public readonly status!: UserStatus

	@Field(() => [Share])
	public readonly shares!: Share[]

	public static fromDBResult(dbResult: IUserDBResult): Viewer {
		return plainToClass(Viewer, <Viewer>{
			id: dbResult.user_id.toString(),
			name: dbResult.name,
			email: dbResult.email,
			status: dbResult.invitation_token === null ? UserStatus.Accepted : UserStatus.Pending,
		})
	}
}

@ObjectType({ description: "Object representing a share member", implements: IUser })
export class ShareMember extends IUser {
	@Field(() => String)
	public readonly dateJoined!: string

	@Field(() => String)
	public readonly shareID!: string

	@PermissionAuth([Permissions.SHARE_OWNER])
	@Field(() => [String])
	public readonly permissions!: string[]

	public static fromDBResult(
		dbResult: IUserDBResult & { date_joined: Date; share_id: string; permissions: string[] },
	): ShareMember {
		return plainToClass(ShareMember, <ShareMember>{
			id: dbResult.user_id.toString(),
			name: dbResult.name,
			email: dbResult.email,
			dateJoined: dbResult.date_joined.toISOString(),
			permissions: dbResult.permissions,
		})
	}
}
