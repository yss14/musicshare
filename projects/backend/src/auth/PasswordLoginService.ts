import * as argon2 from 'argon2';
import { UserLoginCredentialsTable, CoreTables, UsersTable } from '../database/schema/tables';
import { IDatabaseClient, SQL } from 'postgres-schema-builder';
import { IAuthenticationService } from './AuthenticationService';
import { IUserService } from '../services/UserService';

interface IRegsiterArgs {
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

export const PasswordLoginService = ({ authService, database, userService }: IPasswordLoginServiceArgs): IPasswordLoginService => {
	const register = async ({ userID, password }: IRegsiterArgs) => {
		const passwordHashed = await hashPassword(password);

		await database.query(UserLoginCredentialsTable.insertFromObj({
			user_id_ref: userID,
			credential: passwordHashed,
			date_added: new Date(),
			date_removed: null
		}));
	}

	const login = async (email: string, password: string) => {
		const getUserCredentialsQuery = SQL.raw<typeof CoreTables.user_login_credentials>(`
			SELECT uc.* FROM ${UserLoginCredentialsTable.name}
			INNER JOIN ${UsersTable.name} u ON u.user_id = uc.user_id_ref
			WHERE u.email = $1 AND uc.date_removed IS NULL;
		`);

		const loginCredentials = await database.query(getUserCredentialsQuery);

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