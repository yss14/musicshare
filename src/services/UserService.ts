import { DatabaseConnection } from '../database/DatabaseConnection';
import { IUserDBResult } from '../database/schema/initial-schema';
import { plainToClass } from "class-transformer";
import { User } from '../models/UserModel';

export class UserNotFoundError extends Error {
	constructor(id: string) {
		super(`User with id ${id} not found`);
	}
}

export interface IUserService {
	getUserByID(id: string): Promise<User>;
}

export class UserService implements IUserService {
	constructor(
		private readonly database: DatabaseConnection,
	) { }

	public async getUserByID(id: string): Promise<User> {
		const rows = await this.database.select<IUserDBResult>(`
			SELECT * FROM users WHERE id = ?;
		`, [id]);

		if (rows.length !== 1) {
			throw new UserNotFoundError(id);
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