import { ObjectType, Field } from "type-graphql";
import { IPlaylistByShareDBResult } from "../database/schema/tables";
import { plainToClass } from "class-transformer";

@ObjectType({ description: 'This represents a playlist' })
export class Playlist {
	@Field()
	public readonly id!: string;

	@Field()
	public readonly name!: string;

	@Field()
	public readonly shareID!: string;

	@Field()
	public readonly dateAdded!: Date;

	public static fromDBResult(dbResult: IPlaylistByShareDBResult): Playlist {
		return plainToClass(
			Playlist,
			{
				id: dbResult.playlist_id.toString(),
				name: dbResult.name,
				shareID: dbResult.share_id.toString(),
				dateAdded: dbResult.playlist_id.getDate(),
			}
		);
	}
}