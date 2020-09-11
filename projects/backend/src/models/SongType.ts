import { ISongType } from "./interfaces/SongType"
import { ObjectType, Field } from "type-graphql"
import { ISongTypeDBResult } from "../database/tables"
import { plainToClass } from "class-transformer"

@ObjectType({ description: "This represents a song song" })
export class SongType implements ISongType {
	@Field()
	public readonly id!: string

	@Field()
	public readonly name!: string

	@Field()
	public readonly group!: string

	@Field()
	public readonly hasArtists!: boolean

	@Field(() => [String])
	public readonly alternativeNames!: string[]

	public static fromDBResult(dbResult: ISongTypeDBResult): SongType {
		return plainToClass(SongType, {
			id: dbResult.song_type_id,
			name: dbResult.name,
			group: dbResult.group,
			hasArtists: dbResult.has_artists,
			alternativeNames: dbResult.alternative_names || [],
		})
	}

	public static fromObject(obj: ISongType): SongType {
		return plainToClass(SongType, {
			id: obj.id,
			name: obj.name,
			group: obj.group,
			hasArtists: obj.hasArtists,
			alternativeNames: obj.alternativeNames || [],
		})
	}
}
