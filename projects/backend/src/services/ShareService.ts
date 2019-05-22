import { Share } from '../models/ShareModel';
import { SharesByUserTable } from '../database/schema/tables';
import { TimeUUID } from '../types/TimeUUID';
import { IDatabaseClient } from 'cassandra-schema-builder';

export class ShareNotFoundError extends Error {
	constructor(shareID: string) {
		super(`Share with id ${shareID} not found`);
	}
}

export interface IShareService {
	getSharesByUser(userID: string): Promise<Share[]>;
	getShareByID(shareID: string, userID: string): Promise<Share>;
	createShare(ownerUserID: string, name: string): Promise<void>;
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
			SharesByUserTable.select('*', ['id', 'user_id'])([TimeUUID(shareID), TimeUUID(userID)])
		);

		if (!dbResults || dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		}

		return Share.fromDBResult(dbResults[0]);
	}

	public async createShare(ownerUserID: string, name: string) {
		return this.addUserToShare(TimeUUID().toString(), ownerUserID, name, true);
	}

	public async addUser(shareID: string, userID: string, name: string) {
		return this.addUserToShare(shareID, userID, name, false);
	}

	private async addUserToShare(shareID: string, userID: string, name: string, isLib: boolean): Promise<void> {
		await this.database.query(
			SharesByUserTable.insert(['id', 'user_id', 'name', 'is_library'])
				([TimeUUID(shareID), TimeUUID(userID), name, isLib])
		);
	}
}