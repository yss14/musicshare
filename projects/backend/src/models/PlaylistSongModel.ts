import { ISongDBResultWithShare, ShareSong } from "./SongModel"
import { ObjectType, Field } from "type-graphql"
import { plainToClass } from "class-transformer"
import { IPlaylistSong } from "@musicshare/shared-types/src"
import { IPlaylistSongDBResult } from "../database/tables"

@ObjectType()
export class PlaylistSong extends ShareSong implements IPlaylistSong {
	@Field()
	public readonly playlistSongID!: string

	@Field()
	public readonly position!: number

	public static fromDBResult(result: ISongDBResultWithShare & IPlaylistSongDBResult) {
		return plainToClass(PlaylistSong, <PlaylistSong>{
			...ShareSong.fromDBResult(result),
			playlistSongID: result.playlist_song_id,
			position: result.position,
		})
	}
}
