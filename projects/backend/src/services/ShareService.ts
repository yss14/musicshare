import { User } from '../models/UserModel';
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
	getSharesByUser(user: User): Promise<Share[]>;
	getShareByID(shareID: string): Promise<Share>;
}

export class ShareService implements IShareService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getSharesByUser(user: User): Promise<Share[]> {
		const dbResults = await this.database.query(
			SharesByUserTable.select('*', ['user_id'])([TimeUUID(user.id)])
		);

		return dbResults.map(Share.fromDBResult);
	}

	public async getShareByID(shareID: string): Promise<Share> {
		const dbResults = await this.database.query(
			SharesByUserTable.select('*', ['id'], true)([TimeUUID(shareID)])
		);

		if (dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		}

		return Share.fromDBResult(dbResults[0]);
	}
}