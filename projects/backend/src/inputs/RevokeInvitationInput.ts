import { InputType, Field } from "type-graphql";
import { Length } from 'class-validator'

@InputType()
export class RevokeInvitationInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly shareID!: string;

	@Length(36, 36)
	@Field(() => String)
	public readonly userID!: string;
}