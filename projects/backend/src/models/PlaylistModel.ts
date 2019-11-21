import { ObjectType, Field } from "type-graphql";
import { IPlaylistDBResult } from "../database/tables";
import { plainToClass } from "class-transformer";

@ObjectType({ description: 'This represents a playlist' })
export class Playlist {
	@Field()
	public readonly id!: string;

	@Field()
	public readonly name!: string;

	@Field()
	public readonly dateAdded!: Date;

	@Field()
	public readonly shareID!: string;

	public static fromDBResult(dbResult: IPlaylistDBResult, shareID: string): Playlist {
		return plainToClass(
			Playlist,
			{
				id: dbResult.playlist_id.toString(),
				name: dbResult.name,
				dateAdded: dbResult.date_added,
				shareID,
			}
		);
	}
}