import { ObjectType, Field } from "type-graphql"
import { ShareSong } from "./SongModel"
import { Viewer } from "./UserModel"

@ObjectType()
export class SongPlay {
	@Field(() => ShareSong)
	public readonly song!: ShareSong

	@Field(() => Viewer)
	public readonly user!: Viewer

	@Field()
	public readonly dateAdded!: Date
}
