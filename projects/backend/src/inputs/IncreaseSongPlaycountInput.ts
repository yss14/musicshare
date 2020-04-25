import { InputType, Field } from "type-graphql"
import { Length } from "class-validator"

@InputType()
export class IncreaseSongPlaycountInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly shareID!: string

	@Length(36, 36)
	@Field(() => String)
	public readonly songID!: string
}
