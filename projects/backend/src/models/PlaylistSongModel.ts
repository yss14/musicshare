import { ISongDBResultWithShare, ShareSong } from "./SongModel"
import { ObjectType, Field } from "type-graphql"
import { plainToClass } from "class-transformer"

@ObjectType()
export class PlaylistSong extends ShareSong {
	@Field()
	public readonly playlistSongID!: string

	public static fromDBResult(result: ISongDBResultWithShare & { playlist_song_id: string }) {
		return plainToClass(PlaylistSong, {
			...ShareSong.fromDBResult(result),
			playlistSongID: result.playlist_song_id,
		})
	}
}
