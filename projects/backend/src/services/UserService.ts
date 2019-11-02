import { User } from '../models/UserModel';
import { IDatabaseClient } from "postgres-schema-builder";
import { UsersTable } from "../database/schema/tables";
import { v4 as uuid } from 'uuid';
import { ForbiddenError } from 'apollo-server-core';

export class UserNotFoundError extends ForbiddenError {
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
			UsersTable.select('*', ['user_id'])([id])
		);

		if (dbResults.length !== 1) {
			throw new UserNotFoundError('id', id);
		}

		return User.fromDBResult(dbResults[0]);
	}

	public async getUserByEMail(email: string): Promise<User> {
		const dbResults = await this.database.query(
			UsersTable.select('*', ['email'])([email])
		);

		if (dbResults.length !== 1) {
			throw new UserNotFoundError('email', email);
		}

		return User.fromDBResult(dbResults[0]);
	}

	public async create(name: string, email: string): Promise<User> {
		const id = uuid();
		const date = new Date();

		await this.database.query(
			UsersTable.insert(['user_id', 'name', 'email', 'date_added'])([id, name, email, date])
		);

		return User.fromDBResult({ user_id: id, name, email, date_added: date, date_removed: null });
	}

	public async getAll(): Promise<User[]> {
		const dbResults = await this.database.query(
			UsersTable.selectAll('*')
		);

		return dbResults.map(User.fromDBResult);
	}
}