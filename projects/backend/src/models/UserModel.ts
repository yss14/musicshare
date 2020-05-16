import { Share } from "./ShareModel"
import { ObjectType, Field, registerEnumType, InterfaceType } from "type-graphql"
import { IUserDBResult } from "../database/tables"
import { UserStatus } from "@musicshare/shared-types"
import { plainToClass } from "class-transformer"

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
		return plainToClass(Viewer, {
			id: dbResult.user_id.toString(),
			name: dbResult.name,
			email: dbResult.email,
			status: dbResult.invitation_token === null ? UserStatus.Accepted : UserStatus.Pending,
		})
	}
}
