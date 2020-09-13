import { IGenre } from "./interfaces/Genre"
import { ObjectType, Field } from "type-graphql"
import { IGenreDBResult } from "../database/tables"
import { plainToClass } from "class-transformer"

@ObjectType({ description: "This represents a song genre" })
export class Genre implements IGenre {
	@Field()
	public readonly id!: string

	@Field()
	public readonly name!: string

	@Field()
	public readonly group!: string

	public static fromDBResult(dbResult: IGenreDBResult): Genre {
		return plainToClass(Genre, <Genre>{
			id: dbResult.genre_id,
			name: dbResult.name,
			group: dbResult.group,
		})
	}

	public static fromObject(obj: IGenre): Genre {
		return plainToClass(Genre, <Genre>{
			id: obj.id,
			name: obj.name,
			group: obj.group,
		})
	}
}
