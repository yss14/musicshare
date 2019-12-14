import { ObjectType, Field } from "type-graphql";
import { Song } from "./SongModel";
import { User } from "./UserModel";

@ObjectType()
export class SongPlay {
	@Field(type => Song)
	public readonly song!: Song;

	@Field(type => User)
	public readonly user!: User;

	@Field()
	public readonly dateAdded!: Date;
}
