import { ObjectType, Field } from "type-graphql"
import { Song } from "./SongModel"
import { plainToClass } from "class-transformer"
import { IShareDBResult } from "../database/tables"

@ObjectType({ description: "Object representing a share or a personal library" })
export class Share {
	@Field()
	public readonly id!: string

	@Field()
	public readonly name!: string

	@Field()
	public readonly isLibrary!: boolean

	@Field(() => [Song])
	public readonly songs!: Song[]

	@Field(() => Song, { nullable: true })
	public readonly song!: Song | null

	public static fromDBResult(dbResult: IShareDBResult): Share {
		return plainToClass(Share, {
			id: dbResult.share_id.toString(),
			name: dbResult.name,
			isLibrary: dbResult.is_library,
		})
	}
}
