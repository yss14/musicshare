import { ObjectType, Field } from "type-graphql"
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

	public static fromDBResult(dbResult: IShareDBResult): Share {
		return plainToClass(Share, {
			id: dbResult.share_id.toString(),
			name: dbResult.name,
			isLibrary: dbResult.is_library,
		})
	}
}
