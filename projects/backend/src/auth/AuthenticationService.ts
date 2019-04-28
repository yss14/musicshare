import * as JWT from 'jsonwebtoken';
import { User } from '../models/UserModel';
import { Scopes } from '../types/context';
import { __PROD__ } from '../utils/env/env-constants';

interface IJWTTokenSchema {
	userID: string;
	userName: string;
	email: string;
	scopes: Scopes;
}

export interface IAuthenticationService {
	issueToken(user: User, scopes: Scopes, expiresIn?: string | number): Promise<string>;
	verifyToken(token: string): Promise<IJWTTokenSchema>;
}

export class AuthenticationService implements IAuthenticationService {
	constructor(
		private readonly jwtSecret: string,
	) { }

	public async issueToken(user: User, scopes: Scopes, expiresIn?: string | number): Promise<string> {
		const jwtPayload: IJWTTokenSchema = {
			userID: user.id,
			userName: user.name,
			email: user.email,
			scopes
		}
		const defaultExpire = __PROD__ ? '14 days' : '365 days';

		const jwtToken = JWT.sign(jwtPayload, this.jwtSecret, { expiresIn: expiresIn || defaultExpire });

		return jwtToken;
	}

	public async verifyToken(token: string): Promise<IJWTTokenSchema> {
		return new Promise<IJWTTokenSchema>((resolve, reject) => {
			JWT.verify(token, this.jwtSecret, {}, (err, payload) => {
				if (err) {
					reject(err);

					return;
				}

				resolve(typeof payload === 'object' ? payload : JSON.parse(payload));
			});
		});
	}
}