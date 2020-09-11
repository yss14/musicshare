import { Field, ArgsType, Float } from "type-graphql"
import { Min, Max } from "class-validator"

@ArgsType()
export class FindNearDuplicatesInput {
	@Field(() => String)
	public readonly title!: string

	@Field(() => String)
	public readonly artist!: string

	@Min(0)
	@Max(1)
	@Field(() => Float, { nullable: true })
	public readonly threshould!: number
}
