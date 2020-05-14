import { ShareSong } from "../models/SongModel"
import { Field, InputType } from "type-graphql"
import { MinLength, MaxLength, Min, Max, IsInt } from "class-validator"

@InputType()
export class SongUpdateInput implements Partial<ShareSong> {
	@Field({ nullable: true })
	@MinLength(1)
	@MaxLength(200)
	public readonly title?: string

	@Field({ nullable: true })
	@MaxLength(200)
	public readonly suffix?: string

	@Field({ nullable: true })
	@IsInt()
	@Min(1800)
	@Max(2040)
	public readonly year?: number

	@Field({ nullable: true })
	@IsInt()
	@Min(40)
	@Max(200)
	public readonly bpm?: number

	@Field({ nullable: true })
	public readonly releaseDate?: string

	@Field({ nullable: true })
	public readonly isRip?: boolean

	@Field(() => [String], { nullable: true })
	@MinLength(1, { each: true })
	public readonly artists?: string[]

	@Field(() => [String], { nullable: true })
	@MinLength(1, { each: true })
	public readonly remixer?: string[]

	@Field(() => [String], { nullable: true })
	@MinLength(1, { each: true })
	public readonly featurings?: string[]

	@Field(() => String, { nullable: true })
	@MinLength(1)
	public readonly type?: string | null

	@Field(() => [String], { nullable: true })
	@MinLength(1, { each: true })
	public readonly genres?: string[]

	@Field(() => String, { nullable: true })
	public readonly labels?: string[]

	@Field(() => [String], { nullable: true })
	@MinLength(1, { each: true })
	public readonly tags?: string[]

	public isValid() {
		const nonNullableAttributes: (keyof SongUpdateInput)[] = ["title", "artists", "type", "isRip"]

		for (const nonNullableAttribute of nonNullableAttributes) {
			if (this[nonNullableAttribute] === null) {
				throw new Error(`SongInput attribute ${nonNullableAttribute} cannot be set null explicitly`)
			}
		}

		return true
	}
}
