import { User } from '../models/UserModel';
import { IDatabaseClient } from "cassandra-schema-builder";
import { UsersTable } from "../database/schema/tables";
import { TimeUUID } from "../types/TimeUUID";

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
		private readonly database: IDatabaseClient,
	) { }

	public async getUserByID(id: string): Promise<User> {
		const dbResults = await this.database.query(
			UsersTable.select('*', ['id'])([TimeUUID.fromString(id)])
		);

		if (dbResults.length !== 1) {
			throw new UserNotFoundError(id);
		}

		return User.fromDBResult(dbResults[0]);
	}
}