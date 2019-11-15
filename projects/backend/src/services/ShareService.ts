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
	getLinkedLibrariesOfUser(userID: string): Promise<Share[]>;
	create(ownerUserID: string, name: string, isLib: boolean, shareID?: string): Promise<Share>;
	rename(shareID: string, name: string): Promise<void>;
	delete(shareID: string): Promise<void>;
	addUser(shareID: string, userID: string, permissions: Permission[]): Promise<void>;
	removeUser(shareID: string, userID: string): Promise<void>;
}

export class ShareService implements IShareService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSharesOfUser(userID: string): Promise<Share[]> {
		const userSharesQuery = SQL.raw<typeof CoreTables.shares>(`
			SELECT s.* 
			FROM ${SharesTable.name} s
			INNER JOIN ${UserSharesTable.name} us ON us.share_id_ref = s.share_id
			WHERE us.user_id_ref = $1 AND s.date_removed IS NULL
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

	public async getLinkedLibrariesOfUser(userID: string): Promise<Share[]> {
		const dbResults = await this.database.query(
			SQL.raw<typeof CoreTables.shares>(`
				WITH usershares as (
					SELECT DISTINCT user_shares.share_id_ref as share_id
					FROM user_shares, shares
					WHERE user_shares.user_id_ref = $1
						AND user_shares.share_id_ref = shares.share_id
						AND shares.date_removed IS NULL
				),
				relatedlibraries as (
					SELECT DISTINCT libraries.*
					FROM shares as libraries, user_shares us1, user_shares us2, usershares
					WHERE usershares.share_id = us1.share_id_ref
						AND us1.user_id_ref = us2.user_id_ref
						AND us2.share_id_ref = libraries.share_id
						AND libraries.date_removed IS NULL
						AND libraries.is_library = true
				)
				SELECT * FROM relatedlibraries;
			`, [userID])
		)

		return dbResults.map(Share.fromDBResult)
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

	public async removeUser(shareID: string, userID: string): Promise<void> {
		await this.database.query(
			UserSharesTable.delete(['share_id_ref', 'user_id_ref'])([shareID, userID])
		)
	}

	public async rename(shareID: string, name: string): Promise<void> {
		await this.database.query(
			SharesTable.update(['name'], ['share_id'])([name], [shareID])
		)
	}

	public async delete(shareID: string): Promise<void> {
		await this.database.query(
			SharesTable.update(['date_removed'], ['share_id'])([new Date()], [shareID])
		)
	}
}