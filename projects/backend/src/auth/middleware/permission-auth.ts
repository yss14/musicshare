import { Permission } from "@musicshare/shared-types/src/permissions"
import { Middleware } from "type-graphql/dist/interfaces/Middleware"
import { IGraphQLContext } from "../../types/context"
import { UseMiddleware } from "type-graphql"
import { getShareIDFromRequest, getCurrentPermissionsForShare, hasAllPermissions } from "./auth-selectors"
import { ForbiddenError } from "apollo-server-core"

const makePermissionAuth = (permissions: Permission[]): Middleware<IGraphQLContext> => async (
	{ root, args, context },
	next,
) => {
	const {
		scopes,
		userID,
		services: { shareService },
	} = context
	let shareID = getShareIDFromRequest({ root, args })

	if (!shareID) {
		const userLibrary = await shareService.getUserLibrary(userID!)
		shareID = userLibrary.id
	}

	const userSharePermissions = getCurrentPermissionsForShare(shareID, scopes)
	const isPermitted = hasAllPermissions(permissions, userSharePermissions)

	if (!isPermitted) {
		throw new ForbiddenError(`User has insufficient permissions to perform this action!`)
	}

	return next()
}

export const PermissionAuth = (permissions: Permission[]) => {
	return UseMiddleware(makePermissionAuth(permissions))
}
