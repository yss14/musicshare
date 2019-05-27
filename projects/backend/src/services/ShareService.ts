import { Permissions } from './../auth/permissions';
import { Share } from '../models/ShareModel';
import { SharesByUserTable } from '../database/schema/tables';
import { TimeUUID } from '../types/TimeUUID';
import { IDatabaseClient } from 'postgres-schema-builder';

export class ShareNotFoundError extends Error {
	constructor(shareID: string) {
		super(`Share with id ${shareID} not found`);
	}
}

export interface IShareService {
	getSharesByUser(userID: string): Promise<Share[]>;
	getShareByID(shareID: string, userID: string): Promise<Share>;
	create(ownerUserID: string, name: string): Promise<Share>;
	addUser(shareID: string, userID: string, name: string): Promise<void>;
}

export class ShareService implements IShareService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSharesByUser(userID: string): Promise<Share[]> {
		const dbResults = await this.database.query(
			SharesByUserTable.select('*', ['user_id'])([TimeUUID(userID)])
		);

		return dbResults.map(Share.fromDBResult);
	}

	public async getShareByID(shareID: string, userID: string): Promise<Share> {
		const dbResults = await this.database.query(
			SharesByUserTable.select('*', ['share_id', 'user_id'])([TimeUUID(shareID), TimeUUID(userID)])
		);

		if (!dbResults || dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		}

		return Share.fromDBResult(dbResults[0]);
	}

	public async create(ownerUserID: string, name: string): Promise<Share> {
		const shareID = TimeUUID();
		await this.addUserToShare(shareID.toString(), ownerUserID, name, true, Permissions.ALL);

		return Share.fromDBResult({ share_id: shareID, name: name, user_id: TimeUUID(ownerUserID), is_library: true, permissions: [] });
	}

	public async addUser(shareID: string, userID: string, name: string): Promise<void> {
		return this.addUserToShare(shareID, userID, name, false, Permissions.NONE);
	}

	private async addUserToShare(shareID: string, userID: string, name: string, isLib: boolean, permissions: string[]) {
		await this.database.query(
			SharesByUserTable.insert(['share_id', 'user_id', 'name', 'is_library', 'permissions'])
				([TimeUUID(shareID), TimeUUID(userID), name, isLib, permissions])
		);
	}
}