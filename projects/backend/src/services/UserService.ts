import { User } from '../models/UserModel';
import { UserStatus } from '@musicshare/shared-types'
import { IDatabaseClient, SQL } from "postgres-schema-builder";
import { UsersTable, UserSharesTable, Tables } from "../database/tables";
import { v4 as uuid } from 'uuid';
import { ForbiddenError, ValidationError } from 'apollo-server-core';
import { IConfig } from '../types/config';
import { IInvitationPayload, isInvitationPayload } from '@musicshare/shared-types';
import * as JWT from 'jsonwebtoken';
import { IService, IServices } from './services';
import { Permissions } from '@musicshare/shared-types';

export class UserNotFoundError extends ForbiddenError {
	constructor(filterColumn: string, value: string) {
		super(`User with ${filterColumn} ${value} not found`);
	}
}

export interface IInviteToShareReturnType {
	invitationLink: string;
	createdUser: User;
}

export interface IUserService {
	getUserByID(id: string): Promise<User>;
	getUserByEMail(email: string): Promise<User>;
	getAll(): Promise<User[]>;
	getUsersOfShare(shareID: string): Promise<User[]>;
	create(name: string, email: string): Promise<User>;
	inviteToShare(shareID: string, inviterID: string, email: string): Promise<IInviteToShareReturnType>;
	acceptInvitation(invitationToken: string, name: string, password: string): Promise<User>;
	revokeInvitation(userID: string): Promise<void>;
}

export class UserService implements IUserService, IService {
	public readonly services!: IServices;

	constructor(
		private readonly database: IDatabaseClient,
		private readonly config: IConfig,
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

		return User.fromDBResult({ user_id: id, name, email, date_added: date, date_removed: null, invitation_token: null });
	}

	public async getAll(): Promise<User[]> {
		const dbResults = await this.database.query(
			UsersTable.selectAll('*')
		);

		return dbResults.map(User.fromDBResult);
	}

	public async getUsersOfShare(shareID: string): Promise<User[]> {
		const dbResults = await this.database.query(
			SQL.raw<typeof Tables.users>(`
				SELECT u.*
				FROM ${UsersTable.name} u
				INNER JOIN ${UserSharesTable.name} us ON us.user_id_ref = u.user_id
				WHERE us.share_id_ref = $1
					AND u.date_removed IS NULL;
			`, [shareID])
		)

		return dbResults.map(User.fromDBResult)
	}

	public async inviteToShare(shareID: string, inviterID: string, email: string): Promise<IInviteToShareReturnType> {
		const invitationToken = uuid()
		const userID = uuid()
		const dateAdded = new Date()
		const name = `Invited User ${inviterID}`
		const payload: IInvitationPayload = {
			shareID,
			inviterID,
			email,
			invitationToken,
		}

		const payloadEncrypted = JWT.sign(payload, this.config.jwt.secret, { expiresIn: '90 days' })

		await this.database.query(
			UsersTable.insert(['user_id', 'name', 'email', 'date_added', 'invitation_token'])
				([userID, name, email, dateAdded, invitationToken])
		);
		await this.services.shareService.addUser(shareID, userID, Permissions.NEW_MEMBER)

		const invitationLink = `${this.config.frontend.baseUrl}/invitation/${payloadEncrypted}`

		return {
			invitationLink,
			createdUser: User.fromDBResult({
				user_id: userID,
				date_added: dateAdded,
				date_removed: null,
				email,
				invitation_token: inviterID,
				name
			})
		};
	}

	public async acceptInvitation(token: string, name: string, password: string): Promise<User> {
		try {
			const tokenDecoded = JWT.verify(token, this.config.jwt.secret)

			if (!isInvitationPayload(tokenDecoded)) throw new ValidationError('invitationToken\'s payload is not an object')

			const payload: IInvitationPayload = tokenDecoded
			const user = await this.getUserByInvitationToken(payload.invitationToken)

			await this.database.query(
				UsersTable.update(['name', 'invitation_token'], ['user_id'])([name, null], [user.id])
			)
			await this.services.passwordLoginService.register({ userID: user.id, password })
			const userLibrary = await this.services.shareService.create(user.id, `${name}'s Library`, true)
			await this.services.seedService.seedShare(userLibrary.id)

			return this.getUserByID(user.id)
		} catch (err) {
			if (err instanceof UserNotFoundError) throw err

			throw new ValidationError('invitationToken is invalid')
		}
	}

	private async getUserByInvitationToken(token: string): Promise<User> {
		const dbResults = await this.database.query(
			UsersTable.select('*', ['invitation_token'])([token])
		)

		if (dbResults.length === 1 && dbResults[0].date_removed === null) {
			return User.fromDBResult(dbResults[0])
		}

		throw new UserNotFoundError('invitation_token', token);
	}

	public async revokeInvitation(userID: string): Promise<void> {
		const user = await this.getUserByID(userID)

		if (user.status === UserStatus.Accepted) {
			throw new ForbiddenError('User has already accepted invitation')
		}

		await this.database.query(
			SQL.raw(`
				DELETE FROM ${UsersTable.name}
				WHERE user_id = $1 AND invitation_token IS NOT NULL AND date_removed IS NULL;
			`, [userID])
		)
	}
}