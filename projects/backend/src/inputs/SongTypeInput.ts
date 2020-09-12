import { ArgsType, Field } from "type-graphql"
import { MinLength, Length } from "class-validator"

@ArgsType()
export class CreateSongTypeInput {
	@Field()
	@MinLength(2)
	public readonly group!: string

	@Field()
	@MinLength(2)
	public readonly name!: string

	@Field(() => [String], { nullable: true })
	@MinLength(1, { each: true })
	public readonly alternativeNames?: string[]

	@Field({ defaultValue: false })
	public readonly hasArtists!: boolean
}

@ArgsType()
export class UpdateSongTypeInput extends CreateSongTypeInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly songTypeID!: string
}

@ArgsType()
export class RemoveSongTypeInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly songTypeID!: string
}
