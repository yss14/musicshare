import { ObjectType, Field } from "type-graphql";
import { Song } from "./SongModel";
import { IShareByUserDBResult } from "../database/schema/initial-schema";
import { plainToClass } from "class-transformer";

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

	@Field(type => [Song])
	public readonly songs!: Song[];

	@Field(type => Song, { nullable: true })
	public readonly song!: Song | null;

	public static fromDBResult(dbResult: IShareByUserDBResult): Share {
		return plainToClass(
			Share,
			{
				id: dbResult.id.toString(),
				name: dbResult.name,
				userID: dbResult.user_id.toString(),
				isLibrary: dbResult.is_library
			}
		);
	}
}