import { ArgsType, Field } from "type-graphql";
import { Length } from "class-validator";

@ArgsType()
export class UserIDArg {
	@Length(36, 36)
	@Field(() => String)
	public readonly userID!: string;
}