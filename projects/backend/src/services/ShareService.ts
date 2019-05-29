import { Permissions, Permission } from './../auth/permissions';
import { Share } from '../models/ShareModel';
import { IDatabaseClient, SQL } from 'postgres-schema-builder';
import { CoreTables, SharesTable, UserSharesTable } from '../database/schema/tables';
import { v4 as uuid } from 'uuid';

export class ShareNotFoundError extends Error {
	constructor(shareID: string) {
		super(`Share with id ${shareID} not found`);
	}
}

export interface IShareService {
	getSharesOfUser(userID: string): Promise<Share[]>;
	getShareByID(shareID: string, userID: string): Promise<Share>;
	create(ownerUserID: string, name: string): Promise<Share>;
	addUser(shareID: string, userID: string, name: string, permissions: Permission[]): Promise<void>;
}

export class ShareService implements IShareService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSharesOfUser(userID: string): Promise<Share[]> {
		const userSharesQuery = SQL.raw<typeof CoreTables.shares>(`
			SELECT s.* FROM ${SharesTable.name}
			INNER JOIN ${UserSharesTable.name} us.share_id_ref = s.share_id
			WHERE us.user_id_ref = $1;
		`, [userID]);

		const dbResults = await this.database.query(userSharesQuery);

		return dbResults.map(Share.fromDBResult);
	}

	public async getShareByID(shareID: string, userID: string): Promise<Share> {
		const dbResults = await this.database.query(
			SharesTable.select('*', ['share_id'])([shareID])
		);

		if (!dbResults || dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		}

		return Share.fromDBResult(dbResults[0]);
	}

	public async create(ownerUserID: string, name: string): Promise<Share> {
		const shareID = uuid();
		const date = new Date();

		await this.database.query(
			SharesTable.insertFromObj({ share_id: shareID, name, date_added: date })
		);
		await this.addUserToShare(shareID, ownerUserID, name, true, Permissions.ALL);

		return Share.fromDBResult({ share_id: shareID, name: name, is_library: true, date_added: date, date_removed: null });
	}

	public async addUser(shareID: string, userID: string, name: string, permissions: Permission[]): Promise<void> {
		return this.addUserToShare(shareID, userID, name, false, permissions);
	}

	private async addUserToShare(shareID: string, userID: string, name: string, isLib: boolean, permissions: string[]) {
		await this.database.query(
			UserSharesTable.insertFromObj({
				user_id_ref: userID,
				share_id_ref: shareID,
				permissions,
				date_added: new Date(),
			})
		);
	}
}