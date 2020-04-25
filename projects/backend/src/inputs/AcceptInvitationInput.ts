import { Field, InputType } from "type-graphql"
import { Length } from "class-validator"

@InputType()
export class AcceptInvitationInput {
	@Length(3, 20)
	@Field(() => String)
	public readonly name!: string

	@Length(8, 40)
	@Field(() => String)
	public readonly password!: string

	@Field(() => String)
	public readonly invitationToken!: string
}
