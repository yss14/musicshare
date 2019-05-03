import { ArgsType, Field } from "type-graphql";
import { Length } from "class-validator";

@ArgsType()
export class ShareIDArg {
	@Length(36, 36)
	@Field(() => String)
	shareID!: string;
}