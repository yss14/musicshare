import { Field, registerEnumType, ArgsType, Int } from "type-graphql"
import { MinLength, Min, Max } from "class-validator"

export enum SongSearchMatcher {
	Title = "title",
	Artists = "artists",
	Tags = "tags",
	Genres = "genres",
	Labels = "labels",
}

registerEnumType(SongSearchMatcher, {
	name: "SongSearchMatcher",
	description: "Specifies Which properties are to be searched",
})

@ArgsType()
export class SongSearchInput {
	@Field()
	@MinLength(2)
	public readonly query!: string

	@Field(() => [SongSearchMatcher], { nullable: true })
	public readonly matcher!: SongSearchMatcher[] | null

	@Field(() => Int, { defaultValue: 20 })
	@Min(1)
	@Max(50)
	public readonly limit!: number
}
