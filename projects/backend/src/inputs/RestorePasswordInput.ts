import { Field, InputType } from "type-graphql"
import { IsEmail, Length } from "class-validator"

@InputType()
export class RestorePasswordInput {
	@Field()
	@IsEmail()
	public readonly email!: string

	@Field()
	@Length(32, 32)
	public readonly restoreToken!: string

	@Field()
	@Length(8)
	public readonly newPassword!: string
}
