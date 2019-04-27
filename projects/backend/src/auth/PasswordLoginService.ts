import * as argon2 from 'argon2';
import { UserLoginCredentialsTable } from '../database/schema/tables';
import { IDatabaseClient } from 'cassandra-schema-builder';
import { TimeUUID } from '../types/TimeUUID';
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

const getUserLoginCredentialsQuery = UserLoginCredentialsTable.select('*', ['email']);
const insertLoginCredentialsQuery = UserLoginCredentialsTable.insert(['email', 'user_id', 'credential']);

export const PasswordLoginService = ({ authService, database, userService }: IPasswordLoginServiceArgs) => {
	const register = async ({ email, userID, password }: IRegsiterArgs) => {
		const passwordHashed = await hashPassword(password);

		await database.query(insertLoginCredentialsQuery([email, TimeUUID(userID), passwordHashed]));
	}

	const login = async (email: string, password: string) => {
		const loginCredentials = await database.query(getUserLoginCredentialsQuery([email]));

		if (loginCredentials.length === 0) {
			throw new Error(`Login for email ${email} not found`);
		}

		const credentialsValid = await argon2.verify(loginCredentials[0].credential, password);

		if (!credentialsValid) {
			throw new Error('Login credentials invalid');
		}

		const user = await userService.getUserByEMail(email);

		const authToken = await authService.issueToken(user, '*');

		return authToken;
	}

	const hashPassword = (password: string) => argon2.hash(password);

	return {
		register,
		login
	}
}