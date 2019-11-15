import { InputType, Field } from "type-graphql";
import { Length } from "class-validator";

@InputType()
export class ShareIDInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly shareID!: string;
}