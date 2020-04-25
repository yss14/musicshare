import { ObjectType, Field } from "type-graphql"
import { Song } from "./SongModel"
import { User } from "./UserModel"

@ObjectType()
export class SongPlay {
	@Field(() => Song)
	public readonly song!: Song

	@Field(() => User)
	public readonly user!: User

	@Field()
	public readonly dateAdded!: Date
}
