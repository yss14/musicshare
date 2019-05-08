import { HTTPStatusCodes } from '../types/http-status-codes';
import { IAuthenticationService } from './AuthenticationService';
import { CustomRequestHandler, IGraphQLContext } from '../types/context';
import { AuthChecker } from 'type-graphql';

export const makeAuthExtractor = (authService: IAuthenticationService): CustomRequestHandler => async (req, res, next) => {
	req.context = { userID: null, scopes: [] };

	try {
		const authHeader = req.headers.authorization;

		if (authHeader === undefined) {
			return next();
		}

		const tokenDecoded = await authService.verifyToken(authHeader);

		if (!tokenDecoded) {
			return res.status(HTTPStatusCodes.UNAUTHORIZED).end();
		}

		const { userID, scopes } = tokenDecoded;

		req.context = { userID, scopes };

		next();
	} catch (err) {
		if (err.name !== 'JsonWebTokenError') {
			console.error(err);

			return res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
		}

		next();
	}
}

export const auth: CustomRequestHandler = (req, res, next) => {
	if (req.context.userID === null) {
		return res.status(HTTPStatusCodes.UNAUTHORIZED).end();
	}

	next();
}

export const graphQLAuthChecker: AuthChecker<IGraphQLContext> = ({ context: { userID, scopes }, root, args }, permissions = []) => {
	if (permissions.length === 0) {
		return userID !== null && userID !== undefined;
	}

	if (!userID) {
		return false;
	}

	return true;
};
