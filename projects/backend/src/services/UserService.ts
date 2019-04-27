import { User } from '../models/UserModel';
import { IDatabaseClient } from "cassandra-schema-builder";
import { UsersTable } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";

export class UserNotFoundError extends Error {
	constructor(filterColumn: string, value: string) {
		super(`User with ${filterColumn} ${value} not found`);
	}
}

export interface IUserService {
	getUserByID(id: string): Promise<User>;
	getUserByEMail(email: string): Promise<User>;
}

export class UserService implements IUserService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getUserByID(id: string): Promise<User> {
		const dbResults = await this.database.query(
			UsersTable.select('*', ['id'])([TimeUUID(id)])
		);

		if (dbResults.length !== 1) {
			throw new UserNotFoundError('id', id);
		}

		return User.fromDBResult(dbResults[0]);
	}

	public async getUserByEMail(email: string): Promise<User> {
		const dbResults = await this.database.query(
			UsersTable.selectWhere(`? IN emails`, [email])
		);

		if (dbResults.length !== 1) {
			throw new UserNotFoundError('email', email);
		}

		return User.fromDBResult(dbResults[0]);
	}
}