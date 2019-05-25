import { ArgsType, Field } from "type-graphql";
import { Length } from "class-validator";

@ArgsType()
export class ShareIDArg {
	@Length(36, 36)
	@Field(() => String)
	public readonly shareID!: string;
}

@ArgsType()
export class ShareNameArg {
	@Length(1, 100)
	@Field(() => String)
	public readonly name!: string;
}