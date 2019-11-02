import { Permissions, Permission } from './../auth/permissions';
import { Share } from '../models/ShareModel';
import { IDatabaseClient, SQL } from 'postgres-schema-builder';
import { CoreTables, SharesTable, UserSharesTable } from '../database/schema/tables';
import { v4 as uuid } from 'uuid';
import { ForbiddenError } from 'apollo-server-core';

export class ShareNotFoundError extends ForbiddenError {
	constructor(shareID: string) {
		super(`Share with id ${shareID} not found`);
	}
}

export interface IShareService {
	getSharesOfUser(userID: string): Promise<Share[]>;
	getShareByID(shareID: string, userID: string): Promise<Share>;
	create(ownerUserID: string, name: string, isLib: boolean, shareID?: string): Promise<Share>;
	addUser(shareID: string, userID: string, permissions: Permission[]): Promise<void>;
}

export class ShareService implements IShareService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSharesOfUser(userID: string): Promise<Share[]> {
		const userSharesQuery = SQL.raw<typeof CoreTables.shares>(`
			SELECT s.* FROM ${SharesTable.name} s
			INNER JOIN ${UserSharesTable.name} us ON us.share_id_ref = s.share_id
			WHERE us.user_id_ref = $1
			ORDER BY s.date_added;
		`, [userID]);

		const dbResults = await this.database.query(userSharesQuery);

		return dbResults.map(Share.fromDBResult);
	}

	public async getShareByID(shareID: string, userID: string): Promise<Share> {
		const dbResults = await this.database.query(SQL.raw<typeof CoreTables.shares>(`
			SELECT s.* FROM ${SharesTable.name} s
			INNER JOIN ${UserSharesTable.name} us ON us.share_id_ref = s.share_id
			WHERE s.share_id = $1 AND us.user_id_ref = $2 AND s.date_removed IS NULL;
		`, [shareID, userID]));

		if (!dbResults || dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		}

		return Share.fromDBResult(dbResults[0]);
	}

	public async create(ownerUserID: string, name: string, isLib: boolean, shareID?: string): Promise<Share> {
		const id = shareID || uuid();
		const date = new Date();

		await this.database.query(
			SharesTable.insertFromObj({ share_id: id, name, date_added: date, is_library: isLib, date_removed: null })
		);
		await this.addUserToShare(id, ownerUserID, Permissions.ALL);

		return Share.fromDBResult({ share_id: id, name: name, is_library: true, date_added: date, date_removed: null });
	}

	public async addUser(shareID: string, userID: string, permissions: Permission[]): Promise<void> {
		return this.addUserToShare(shareID, userID, permissions);
	}

	private async addUserToShare(shareID: string, userID: string, permissions: string[]) {
		await this.database.query(
			UserSharesTable.insertFromObj({
				user_id_ref: userID,
				share_id_ref: shareID,
				permissions,
				date_added: new Date(),
				date_removed: null,
			})
		);
	}
}