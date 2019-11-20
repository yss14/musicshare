import { ObjectType, Field } from "type-graphql";
import { plainToClass } from "class-transformer";

@ObjectType()
export class SongIDUpdate {
	@Field()
	public readonly shareID!: string;

	@Field()
	public readonly playlistID!: string;

	@Field()
	public readonly oldSongID!: string;

	@Field()
	public readonly newSongID!: string;

	@Field()
	public readonly newLibraryID!: string;

	public static create(shareID: string, playlistID: string, oldSongID: string, newSongID: string, newLibraryID: string) {
		return plainToClass(
			SongIDUpdate,
			{
				shareID,
				playlistID,
				oldSongID,
				newSongID,
				newLibraryID,
			}
		)
	}
}