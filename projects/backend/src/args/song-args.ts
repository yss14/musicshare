import { ArgsType, Field } from "type-graphql";
import { Length } from "class-validator";

@ArgsType()
export class SongIDsArg {
	@Length(36, 36, { each: true })
	@Field(() => [String])
	songIDs!: string[];
}