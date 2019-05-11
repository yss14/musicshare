import { HTTPStatusCodes } from '../types/http-status-codes';
import { IAuthenticationService } from './AuthenticationService';
import { CustomRequestHandler, IGraphQLContext } from '../types/context';
import { AuthChecker } from 'type-graphql';
import { IAuthTokenStore } from './AuthTokenStore';

export const makeAuthExtractor = (authService: IAuthenticationService, invalidAuthTokenStore: IAuthTokenStore): CustomRequestHandler =>
	async (req, res, next) => {
		req.context = { userID: null, scopes: [] };

		try {
			const authHeader = req.headers.authorization;

			if (authHeader === undefined) {
				return next();
			}

			const tokenDecoded = await authService.verifyToken(authHeader);

			if (invalidAuthTokenStore.isInvalid(tokenDecoded.tokenID)) {
				req.context.error = { statusCode: HTTPStatusCodes.UNAUTHORIZED, message: 'AuthToken invalid' };

				return next();
			}

			const { userID, scopes } = tokenDecoded;

			req.context = { userID, scopes };

			next();
		} catch (err) {
			// istanbul ignore next
			if (err.name !== 'JsonWebTokenError') {
				console.error(err);

				return res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
			}

			next();
		}
	}

export const auth: CustomRequestHandler = (req, res, next) => {
	const { context } = req;

	if (context.error) {
		return res.status(context.error.statusCode).json({ error: context.error.message });
	}

	if (context.userID === null) {
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
