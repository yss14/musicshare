import { DatabaseConnection } from '../database/DatabaseConnection';
import { Service, Inject } from 'typedi';
import { IShareByUserDBResult } from '../database/schema/initial-schema';
import { plainToClass } from "class-transformer";
import { User } from '../models/user.model';
import { Share } from '../models/share.model';

export class ShareNotFoundError extends Error {
	constructor(shareID: string) {
		super(`Share with id ${shareID} not found`);
	}
}

@Service()
export class ShareService {
	@Inject()
	private readonly database!: DatabaseConnection

	public async getSharesByUser(user: User): Promise<Share[]> {
		const dbResults = await this.database.select<IShareByUserDBResult>(`
			SELECT * FROM shares_by_user WHERE user_id = ?;
		`, [user.id]);

		return dbResults.map(this.fromDBResult);
	}

	public async getShareByID(shareID: string): Promise<Share> {
		const dbResults = await this.database.select<IShareByUserDBResult>(`
			SELECT * FROM shares_by_user WHERE id = ? ALLOW FILTERING;
		`, [shareID]);

		if (dbResults.length === 0) {
			throw new ShareNotFoundError(shareID);
		} else {
			return this.fromDBResult(dbResults[0]);
		}
	}

	private fromDBResult(dbResult: IShareByUserDBResult): Share {
		return plainToClass(
			Share,
			{
				id: dbResult.id.toString(),
				name: dbResult.name,
				userID: dbResult.user_id.toString(),
				isLibrary: dbResult.is_library
			}
		);
	}
}