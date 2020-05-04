import { Field, InputType } from "type-graphql"
import { Length, MinLength } from "class-validator"

@InputType()
export class SubmitSongFromRemoteFileInput {
	@MinLength(5)
	@Field(() => String)
	public readonly filename!: string

	@MinLength(20)
	@Field(() => String)
	public readonly remoteFileUrl!: string

	@Length(36, 36, { each: true })
	@Field(() => [String])
	public readonly playlistIDs!: string[]
}
