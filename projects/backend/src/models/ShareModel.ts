import { ObjectType, Field } from "type-graphql";
import { ShareSong } from "./SongModel";
import { plainToClass } from "class-transformer";
import { IShareByUserDBResult } from "../database/schema/tables";

@ObjectType({ description: "Object representing a share or a personal library" })
export class Share {
	@Field()
	public readonly id!: string;

	@Field()
	public readonly name!: string;

	@Field()
	public readonly userID!: string;

	@Field()
	public readonly isLibrary!: boolean;

	@Field(type => [ShareSong])
	public readonly songs!: ShareSong[];

	@Field(type => ShareSong, { nullable: true })
	public readonly song!: ShareSong | null;

	public static fromDBResult(dbResult: IShareByUserDBResult): Share {
		return plainToClass(
			Share,
			{
				id: dbResult.share_id.toString(),
				name: dbResult.name,
				userID: dbResult.user_id.toString(),
				isLibrary: dbResult.is_library
			}
		);
	}
}