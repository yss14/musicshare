import { Share } from "./ShareModel"
import { ObjectType, Field, registerEnumType } from "type-graphql"
import { IUserDBResult } from "../database/tables"
import { UserStatus } from "@musicshare/shared-types"
import { plainToClass } from "class-transformer"

registerEnumType(UserStatus, {
	name: "UserStatus",
	description: "Specifies whether a user already accepted an invitation or is still pending",
})

@ObjectType({ description: "Object representing a user" })
export class User {
	@Field()
	public readonly id!: string

	@Field()
	public readonly name!: string

	@Field()
	public readonly email!: string

	@Field(() => UserStatus)
	public readonly status!: UserStatus

	@Field(() => [Share])
	public readonly shares!: Share[]

	public static fromDBResult(dbResult: IUserDBResult): User {
		return plainToClass(User, {
			id: dbResult.user_id.toString(),
			name: dbResult.name,
			email: dbResult.email,
			status: dbResult.invitation_token === null ? UserStatus.Accepted : UserStatus.Pending,
		})
	}
}
