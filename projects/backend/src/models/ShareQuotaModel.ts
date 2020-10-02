import { ObjectType, Field } from "type-graphql"
import { IShareDBResult } from "../database/tables"
import { plainToClass } from "class-transformer"

@ObjectType()
export class ShareQuota {
	@Field()
	public readonly shareID!: string

	@Field()
	public readonly quota!: number

	@Field()
	public readonly used!: number

	public static fromDBResult(dbResult: IShareDBResult): ShareQuota {
		return plainToClass(ShareQuota, {
			shareID: dbResult.share_id,
			quota: Number(dbResult.quota),
			used: Number(dbResult.quota_used),
		})
	}
}
