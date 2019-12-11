import { Song } from "./SongModel";
import { ObjectType, Field } from "type-graphql";
import { ISongDBResult } from "../database/tables";
import { plainToClass } from "class-transformer";

@ObjectType()
export class PlaylistSong extends Song {
	@Field()
	public readonly playlistSongID!: string;

	public static fromDBResult(result: ISongDBResult & { playlist_song_id: string }) {
		return plainToClass(
			PlaylistSong,
			{
				...Song.fromDBResult(result),
				playlistSongID: result.playlist_song_id,
			}
		)
	}
}
