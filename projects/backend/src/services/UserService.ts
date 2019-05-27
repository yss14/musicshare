import { User } from '../models/UserModel';
import { IDatabaseClient } from "postgres-schema-builder";
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
	getAll(): Promise<User[]>;
	create(name: string, email: string): Promise<User>;
}

export class UserService implements IUserService {
	constructor(
		private readonly database: IDatabaseClient,
	) { }

	public async getUserByID(id: string): Promise<User> {
		const dbResults = await this.database.query(
			UsersTable.select('*', ['user_id'])([TimeUUID(id)])
		);

		if (dbResults.length !== 1) {
			throw new UserNotFoundError('id', id);
		}

		return User.fromDBResult(dbResults[0]);
	}

	public async getUserByEMail(email: string): Promise<User> {
		const dbResults = await this.database.query(
			UsersTable.select('*', ['email'], true)([email])
		);

		if (dbResults.length !== 1) {
			throw new UserNotFoundError('email', email);
		}

		return User.fromDBResult(dbResults[0]);
	}

	public async create(name: string, email: string): Promise<User> {
		const id = TimeUUID();

		await this.database.query(
			UsersTable.insert(['user_id', 'name', 'email'])([id, name, email])
		);

		return User.fromDBResult({ user_id: id, name, email });
	}

	public async getAll(): Promise<User[]> {
		const dbResults = await this.database.query(
			UsersTable.selectAll('*')
		);

		return dbResults.map(User.fromDBResult);
	}
}