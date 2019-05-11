import * as JWT from 'jsonwebtoken';
import { User } from '../models/UserModel';
import { Scopes } from '../types/context';
import { __PROD__ } from '../utils/env/env-constants';
import { TimeUUID } from '../types/TimeUUID';

interface IAuthTokenBase {
	userID: string;
	userName: string;
	email: string;
}

interface IAuthTokenSchema extends IAuthTokenBase {
	tokenID: string;
	scopes: Scopes;
	refreshToken: string;
}

interface IRefreshTokenSchema extends IAuthTokenBase { }

export interface IAuthenticationService {
	issueRefreshToken(user: User, expiresIn?: string | number): Promise<string>;
	issueAuthToken(user: User, scopes: Scopes, refreshToken: string, expiresIn?: string | number): Promise<string>;
	verifyToken(token: string): Promise<IAuthTokenSchema>;
}

export class AuthenticationService implements IAuthenticationService {
	constructor(
		private readonly jwtSecret: string,
	) { }

	public async issueRefreshToken(user: User, expiresIn?: string | number): Promise<string> {
		const refreshTokenPayload: IRefreshTokenSchema = {
			userID: user.id,
			userName: user.name,
			email: user.email,
		}

		return this.signToken(refreshTokenPayload, expiresIn);
	}

	public async issueAuthToken(user: User, scopes: Scopes, refreshToken: string, expiresIn?: string | number): Promise<string> {
		const authTokenPayload: IAuthTokenSchema = {
			userID: user.id,
			userName: user.name,
			email: user.email,
			scopes,
			tokenID: TimeUUID().toString(),
			refreshToken,
		}

		return this.signToken(authTokenPayload, expiresIn);
	}

	private signToken(payload: IAuthTokenSchema | IRefreshTokenSchema, expiresIn?: string | number) {
		// istanbul ignore next
		const defaultExpire = __PROD__ ? '14 days' : '365 days';

		const jwtToken = JWT.sign(payload, this.jwtSecret, { expiresIn: expiresIn || defaultExpire });

		return jwtToken;
	}

	public async verifyToken(token: string): Promise<IAuthTokenSchema> {
		return new Promise<IAuthTokenSchema>((resolve, reject) => {
			JWT.verify(token, this.jwtSecret, {}, (err, payload) => {
				if (err) {
					reject(err);

					return;
				}

				// istanbul ignore next
				resolve(typeof payload === 'object' ? payload : JSON.parse(payload));
			});
		});
	}
}