import { TableRecord, Table } from "cassandra-schema-builder";
import { DatabaseV1 } from "./V1";

const CoreTables = DatabaseV1;

export interface ISongBaseDBResult extends TableRecord<typeof CoreTables.song_base_schema> { }
export interface IUsersDBResult extends TableRecord<typeof CoreTables.users> { }
export interface IShareByUserDBResult extends TableRecord<typeof CoreTables.shares_by_user> { }
export interface ISongByShareDBResult extends TableRecord<typeof CoreTables.songs_by_shares> { }
export interface ISongTypeByShareDBResult extends TableRecord<typeof CoreTables.song_types_by_share> { }
export interface IGenreByShareDBResult extends TableRecord<typeof CoreTables.genres_by_share> { }
export interface IUserLoginCredentialDBResult extends TableRecord<typeof CoreTables.user_login_credentials> { }
export interface IPlaylistByShareDBResult extends TableRecord<typeof CoreTables.playlists_by_share> { }
export interface ISongByPlaylistDBResult extends TableRecord<typeof CoreTables.songs_by_playlist> { }

export const UsersTable = Table(CoreTables, 'users');
export const SharesByUserTable = Table(CoreTables, 'shares_by_user');
export const SongsByShareTable = Table(CoreTables, 'songs_by_shares');
export const SongTypesByShareTable = Table(CoreTables, 'song_types_by_share');
export const GenresByShareTable = Table(CoreTables, 'genres_by_share');
export const UserLoginCredentialsTable = Table(CoreTables, 'user_login_credentials');
export const PlaylistsByShareTable = Table(CoreTables, 'playlists_by_share');
export const SongsByPlaylistTable = Table(CoreTables, 'songs_by_playlist');
