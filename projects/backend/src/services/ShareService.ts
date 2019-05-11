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
}