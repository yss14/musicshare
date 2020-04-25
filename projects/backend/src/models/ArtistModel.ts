import { ObjectType, Field } from "type-graphql"
import { plainToClass } from "class-transformer"

@ObjectType({ description: "This represents an artist" })
export class Artist {
	@Field()
	public readonly name!: string

	public static fromString(artist: string): Artist {
		return plainToClass(Artist, {
			name: artist,
		})
	}
}
