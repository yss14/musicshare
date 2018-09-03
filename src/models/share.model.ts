import { ObjectType, Field } from "type-graphql";
import { Song } from "./song.model";

@ObjectType({ description: "Object representing a share or a personal library" })
export class Share {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field()
	userID: string;

	@Field()
	isLibrary: boolean;

	@Field(type => [Song])
	songs: Song[];
}