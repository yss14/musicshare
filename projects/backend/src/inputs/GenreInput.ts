import { ArgsType, Field } from "type-graphql"
import { MinLength, Length } from "class-validator"

@ArgsType()
export class CreateGenreInput {
	@Field()
	@MinLength(2)
	public readonly group!: string

	@Field()
	@MinLength(2)
	public readonly name!: string
}

@ArgsType()
export class UpdateGenreInput extends CreateGenreInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly genreID!: string
}
