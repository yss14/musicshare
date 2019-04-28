import { HTTPStatusCodes } from '../types/http-status-codes';
import { IAuthenticationService } from './AuthenticationService';
import { IContext, CustomRequestHandler } from '../types/context';
import { AuthChecker } from 'type-graphql';

export const makeAuthExtractor = (authService: IAuthenticationService): CustomRequestHandler => async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader === undefined) {
		req.context = { userID: null, scopes: [] };

		return next();
	}

	const tokenDecoded = await authService.verifyToken(authHeader);

	if (!tokenDecoded) {
		return res.status(HTTPStatusCodes.UNAUTHORIZED).end();
	}

	const { userID, scopes } = tokenDecoded;

	req.context = { userID, scopes };

	next();
}

export const auth: CustomRequestHandler = (req, res, next) => {
	if (req.context.userID === null) {
		return res.status(HTTPStatusCodes.UNAUTHORIZED).end();
	}

	next();
}

export const graphQLAuthChecker: AuthChecker<IContext> = ({ context: { userID } }, roles) => {
	if (roles.length === 0) {
		return userID !== null && userID !== undefined;
	}

	if (!userID) {
		return false;
	}

	// TODO check scopes when implemented

	return true;
};