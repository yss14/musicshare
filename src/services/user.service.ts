import { DatabaseConnection } from '../database/DatabaseConnection';
import { Service, Inject } from 'typedi';
import { IUserDBResult } from '../database/schema/initial-schema';
import { plainToClass } from "class-transformer";
import { User } from '../models/user.model';

@Service()
export class UserService {
	constructor(
		@Inject("DATABASE") private readonly database: DatabaseConnection
	) { }

	public async getUserByID(id: string): Promise<User | null> {
		const rows = await this.database.select<IUserDBResult>(`
			SELECT * FROM users WHERE id = ?;
		`, [id]);

		if (rows.length !== 1) {
			return null;
		}

		return this.fromDBResult(rows[0]);
	}

	private fromDBResult(dbResult: IUserDBResult): User {
		return plainToClass(
			User,
			{
				id: dbResult.id.toString(),
				name: dbResult.name,
				emails: dbResult.emails
			}
		);
	}
}