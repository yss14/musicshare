import { Field, ArgsType } from "type-graphql";
import { Length } from "class-validator";

@ArgsType()
export class PlaylistIDArg {
	@Length(36, 36)
	@Field(() => String)
	playlistID!: string;
}

@ArgsType()
export class PlaylistNameArg {
	@Length(2, 100)
	@Field(() => String)
	name!: string;
}

@ArgsType()
export class PlaylistNewNameArg {
	@Length(2, 100)
	@Field(() => String)
	newName!: string;
}