import { TableRecord, Table } from "cassandra-schema-builder";
import { DatabaseV1 } from "./V1";

const CoreTables = DatabaseV1;

export interface IUsersDBResult extends TableRecord<typeof CoreTables.users> { }
export interface IShareByUserDBResult extends TableRecord<typeof CoreTables.shares_by_user> { }
export interface ISongByShareDBResult extends TableRecord<typeof CoreTables.songs_by_shares> { }
export interface ISongTypeDBResult extends TableRecord<typeof CoreTables.song_types> { }

export const UsersTable = Table(CoreTables, 'users');
export const SharesByUserTable = Table(CoreTables, 'shares_by_user');
export const SongsByShareTable = Table(CoreTables, 'songs_by_shares');
export const SongTypesTable = Table(CoreTables, 'song_types');
