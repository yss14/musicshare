import { DatabaseConnection } from '../database/DatabaseConnection';
import { IShareByUserDBResult } from '../database/schema/initial-schema';
import { User } from '../models/UserModel';
import { Share } from '../models/ShareModel';

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
		private readonly database: DatabaseConnection,
	) { }

	public async getSharesByUser(user: User): Promise<Share[]> {
		const dbResults = await this.database.select<IShareByUserDBResult>(`
			SELECT * FROM shares_by_user WHERE user_id = ?;
		`, [user.id]);

		return dbResults.map(Share.fromDBResult);
	}

	public async getShareByID(shareID: string): Promise<Share> {
		const dbResults = await this.database.select<IShareByUserDBResult>(`
			SELECT * FROM shares_by_user WHERE id = ? ALLOW FILTERING;
		`, [shareID]);

		if (dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		} else {
			return Share.fromDBResult(dbResults[0]);
		}
	}
}