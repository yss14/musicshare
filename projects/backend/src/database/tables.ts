import { TableRecord, Table } from "postgres-schema-builder";
import { DatabaseV1 } from "./versions/SchemaV1";

export const Tables = DatabaseV1;

export interface IUserDBResult extends TableRecord<typeof Tables.users> { }
export interface IShareDBResult extends TableRecord<typeof Tables.shares> { }
export interface ISongDBResult extends TableRecord<typeof Tables.songs> { }
export interface IPlaylistDBResult extends TableRecord<typeof Tables.playlists> { }
export interface ISongTypeDBResult extends TableRecord<typeof Tables.song_types> { }
export interface IGenreDBResult extends TableRecord<typeof Tables.genres> { }
export interface IUserLoginCredentialDBResult extends TableRecord<typeof Tables.user_login_credentials> { }
export interface IShareTokenDBResult extends TableRecord<typeof Tables.share_tokens> { }
export interface IFileUploadLogDBResult extends TableRecord<typeof Tables.file_upload_logs> { }
export interface ISongPlayDBResult extends TableRecord<typeof Tables.song_plays> { }
export interface IShareSongDBResult extends TableRecord<typeof Tables.share_songs> { }

export const UsersTable = Table(Tables, 'users');
export const SharesTable = Table(Tables, 'shares');
export const UserSharesTable = Table(Tables, 'user_shares');
export const SongsTable = Table(Tables, 'songs');
export const PlaylistsTable = Table(Tables, 'playlists');
export const SharePlaylistsTable = Table(Tables, 'share_playlists');
export const PlaylistSongsTable = Table(Tables, 'playlist_songs');
export const SongTypesTable = Table(Tables, 'song_types');
export const GenresTable = Table(Tables, 'genres');
export const UserLoginCredentialsTable = Table(Tables, 'user_login_credentials');
export const ShareTokensTable = Table(Tables, 'share_tokens');
export const FileUploadLogsTable = Table(Tables, 'file_upload_logs');
export const SongPlaysTable = Table(Tables, 'song_plays');
export const ShareSongsTable = Table(Tables, 'share_songs')
