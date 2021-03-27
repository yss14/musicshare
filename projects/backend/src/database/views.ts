import { TableRecord } from "postgres-schema-builder"
import { ViewsDefinitionsV5, ViewsV5 } from "./tables/SchemaV5"

export const ViewDefinitions = ViewsDefinitionsV5
export const Views = ViewsV5

export type IShareSongsViewDBResult = TableRecord<typeof ViewDefinitions.share_songs_view>
export type IUserSongsViewDBResult = TableRecord<typeof ViewDefinitions.user_songs_view>
export type IShareSongPlaysViewDBResult = TableRecord<typeof ViewDefinitions.share_song_plays_view>
