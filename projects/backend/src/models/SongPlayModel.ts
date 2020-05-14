import { ObjectType, Field } from "type-graphql"
import { ShareSong } from "./SongModel"
import { User } from "./UserModel"

@ObjectType()
export class SongPlay {
	@Field(() => ShareSong)
	public readonly song!: ShareSong

	@Field(() => User)
	public readonly user!: User

	@Field()
	public readonly dateAdded!: Date
}
