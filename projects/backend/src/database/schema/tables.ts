import { TableRecord, Table } from "cassandra-schema-builder";
import { DatabaseV1 } from "./V1";

const CoreTables = DatabaseV1;

export interface IUsersDBResult extends TableRecord<typeof CoreTables.users> { }
export interface IShareByUserDBResult extends TableRecord<typeof CoreTables.sharesByUser> { }
export interface ISongByShareDBResult extends TableRecord<typeof CoreTables.songByShare> { }

export const UsersTable = Table(CoreTables, 'users');
export const SharesByUserTable = Table(CoreTables, 'sharesByUser');
export const SongsByShareTable = Table(CoreTables, 'songByShare');