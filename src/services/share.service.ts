import { Database } from './../database/database';
import { Service, Inject } from 'typedi';
import { IShareByUserDBResult } from '../database/schema/initial-schema';
import { plainToClass } from "class-transformer";
import { User } from '../models/user.model';
import { Share } from '../models/share.model';

@Service()
export class ShareService {
	constructor(
		@Inject("DATABASE") private readonly database: Database
	) { }

	public getSharesByUser(user: User): Promise<Share[]> {
		return this.database.select<IShareByUserDBResult>(`
			SELECT * FROM shares_by_user WHERE user_id = ?;
		`, [user.id])
			.then(rows => rows.map(row => this.fromDBResult(row)));
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