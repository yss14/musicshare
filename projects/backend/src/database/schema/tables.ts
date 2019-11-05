import { TableRecord, Table } from "postgres-schema-builder";
import { DatabaseV1 } from "./V1";

export const CoreTables = DatabaseV1;

export interface IUserDBResult extends TableRecord<typeof CoreTables.users> { }
export interface IShareDBResult extends TableRecord<typeof CoreTables.shares> { }
export interface ISongDBResult extends TableRecord<typeof CoreTables.songs> { }
export interface IPlaylistDBResult extends TableRecord<typeof CoreTables.playlists> { }
export interface ISongTypeDBResult extends TableRecord<typeof CoreTables.song_types> { }
export interface IGenreDBResult extends TableRecord<typeof CoreTables.genres> { }
export interface IUserLoginCredentialDBResult extends TableRecord<typeof CoreTables.user_login_credentials> { }
export interface IShareTokenDBResult extends TableRecord<typeof CoreTables.share_tokens> { }

export interface IShareSongDBResult extends ISongDBResult, TableRecord<typeof CoreTables.share_songs> { } { }

export const UsersTable = Table(CoreTables, 'users');
export const SharesTable = Table(CoreTables, 'shares');
export const UserSharesTable = Table(CoreTables, 'user_shares');
export const SongsTable = Table(CoreTables, 'songs');
export const ShareSongsTable = Table(CoreTables, 'share_songs');
export const PlaylistsTable = Table(CoreTables, 'playlists');
export const SharePlaylistsTable = Table(CoreTables, 'share_playlists');
export const PlaylistSongsTable = Table(CoreTables, 'playlist_songs');
export const SongTypesTable = Table(CoreTables, 'song_types');
export const GenresTable = Table(CoreTables, 'genres');
export const UserLoginCredentialsTable = Table(CoreTables, 'user_login_credentials');
export const ShareTokensTable = Table(CoreTables, 'share_tokens');
