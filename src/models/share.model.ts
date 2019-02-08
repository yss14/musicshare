import { ObjectType, Field } from "type-graphql";
import { Song } from "./song.model";

@ObjectType({ description: "Object representing a share or a personal library" })
export class Share {
	@Field()
	public readonly id!: string;

	@Field()
	public readonly name!: string;

	@Field()
	public readonly userID!: string;

	@Field()
	public readonly isLibrary!: boolean;

	@Field(type => [Song])
	public readonly songs!: Song[];

	@Field(type => Song, { nullable: true })
	public readonly song!: Song | null;
}