import * as JWT from 'jsonwebtoken';
import { User } from '../models/UserModel';
import { Scopes } from '../types/context';

interface IJWTTokenSchema {
	userID: string;
	userName: string;
	emails: string[];
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
			emails: Array.from(user.emails),
			scopes
		}

		const jwtToken = JWT.sign(jwtPayload, this.jwtSecret, { expiresIn });

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