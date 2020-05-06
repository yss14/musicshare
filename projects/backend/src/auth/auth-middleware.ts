import { HTTPStatusCodes } from "../types/http-status-codes"
import { IAuthenticationService } from "./AuthenticationService"
import { CustomRequestHandler, IGraphQLContext } from "../types/context"
import { AuthChecker } from "type-graphql"
import { AuthenticationError } from "apollo-server-core"
import { IShareService } from "../services/ShareService"
import { IPermissionService } from "../services/PermissionsService"

export const makeAuthExtractor = (
	authService: IAuthenticationService,
	permissionService: IPermissionService,
	shareService: IShareService,
): CustomRequestHandler => async (req, res, next) => {
	req.context = { userID: null, scopes: [] }

	try {
		const authToken = req.headers.authorization

		if (authToken === undefined) {
			return next()
		}

		const tokenDecoded = await authService.verifyToken(authToken)
		const { userID } = tokenDecoded

		const scopes = await permissionService.getPermissionsForUserShares(userID)

		const userLibrary = await shareService.getUserLibrary(userID)

		req.context = { userID, scopes, authToken, library: userLibrary }

		next()
	} catch (err) {
		if (err.name === "TokenExpiredError") {
			req.context.error = { statusCode: HTTPStatusCodes.UNAUTHORIZED, message: "AuthToken expired" }

			return next()
		}
		// istanbul ignore next
		if (err.name !== "JsonWebTokenError") {
			console.error(err)

			return res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end()
		}

		next()
	}
}

// this middleware is currently only used for the file upload router
export const auth: CustomRequestHandler = (req, res, next) => {
	const { context } = req

	if (context.error) {
		return res.status(context.error.statusCode).json({ error: context.error.message })
	}

	if (context.userID === null) {
		return res.status(HTTPStatusCodes.UNAUTHORIZED).end()
	}

	next()
}

export const graphQLAuthChecker: AuthChecker<IGraphQLContext> = ({ context: { userID, error } }, permissions = []) => {
	if (error && (error.message === "AuthToken expired" || error.message === "AuthToken invalid")) {
		// throw this error so we can distiguish whether authToken expired
		throw new AuthenticationError(error.message)
	}

	if (permissions.length === 0) {
		return userID !== null && userID !== undefined
	}

	if (!userID) {
		return false
	}

	return true
}
