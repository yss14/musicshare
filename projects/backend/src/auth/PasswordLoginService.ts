import * as argon2 from 'argon2';
import { UserLoginCredentialsTable } from '../database/schema/tables';
import { IDatabaseClient } from 'postgres-schema-builder';
import { v4 as uuid } from 'uuid';
import { IAuthenticationService } from './AuthenticationService';
import { IUserService } from '../services/UserService';

interface IRegsiterArgs {
	email: string;
	password: string;
	userID: string;
}

interface IPasswordLoginServiceArgs {
	database: IDatabaseClient;
	authService: IAuthenticationService;
	userService: IUserService;
}

export interface IPasswordLoginService {
	register(args: IRegsiterArgs): Promise<void>;
	login(email: string, password: string): Promise<string>;
}

export class LoginNotFound extends Error {
	constructor(email: string) {
		super(`Login for email ${email} not found`);
	}
}

export class LoginCredentialsInvalid extends Error {
	constructor() {
		super(`Login credentials invalid`);
	}
}

const getUserLoginCredentialsQuery = UserLoginCredentialsTable.select('*', ['email']);
const insertLoginCredentialsQuery = UserLoginCredentialsTable.insert(['email', 'user_id', 'credential']);

export const PasswordLoginService = ({ authService, database, userService }: IPasswordLoginServiceArgs): IPasswordLoginService => {
	const register = async ({ email, userID, password }: IRegsiterArgs) => {
		const passwordHashed = await hashPassword(password);

		await database.query(insertLoginCredentialsQuery([email, TimeUUID(userID), passwordHashed]));
	}

	const login = async (email: string, password: string) => {
		const loginCredentials = await database.query(getUserLoginCredentialsQuery([email]));

		if (loginCredentials.length === 0) {
			throw new LoginNotFound(email);
		}

		const credentialsValid = await argon2.verify(loginCredentials[0].credential, password);

		if (!credentialsValid) {
			throw new LoginCredentialsInvalid();
		}

		const user = await userService.getUserByEMail(email);

		const refreshToken = await authService.issueRefreshToken(user);

		return refreshToken;
	}

	const hashPassword = (password: string) => argon2.hash(password);

	return {
		register,
		login
	}
}