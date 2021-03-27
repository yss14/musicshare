import { ShareSong } from "./SongModel"
import { ObjectType, Field } from "type-graphql"
import { plainToClass } from "class-transformer"
import { IPlaylistSongDBResult } from "../database/tables"
import { IUserSongsViewDBResult } from "../database/views"

@ObjectType()
export class PlaylistSong extends ShareSong {
	@Field()
	public readonly playlistSongID!: string

	@Field()
	public readonly position!: number

	public static fromDBResult(result: IUserSongsViewDBResult & IPlaylistSongDBResult) {
		return plainToClass(PlaylistSong, <PlaylistSong>{
			...ShareSong.fromDBResult(result),
			playlistSongID: result.playlist_song_id,
			position: result.position,
		})
	}
}
