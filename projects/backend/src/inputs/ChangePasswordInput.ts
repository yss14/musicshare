import { InputType, Field } from "type-graphql"
import { Length } from "class-validator"

@InputType()
export class ChangePasswordInput {
	@Field({ description: "Plain text, hashing takes place at server side" })
	@Length(8)
	public readonly oldPassword!: string

	@Field({ description: "Plain text, hashing takes place at server side" })
	@Length(8)
	public readonly newPassword!: string
}
