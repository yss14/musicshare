import { Field, InputType } from "type-graphql"
import { IsEmail, Length } from "class-validator"

@InputType()
export class InviteToShareInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly shareID!: string

	@IsEmail()
	@Field(() => String)
	public readonly email!: string
}
