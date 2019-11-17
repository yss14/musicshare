import { Permissions } from '@musicshare/shared-types';
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { IGraphQLContext } from "../../types/context";
import { getShareIDFromRequest, hasAllPermissions, getCurrentPermissionsForShare, NoScopesProvidedError } from "./auth-selectors";
import { UseMiddleware } from "type-graphql";
import { MethodAndPropDecorator } from "type-graphql/dist/decorators/types";
import { ForbiddenError } from "apollo-server-core";

interface IShareAuthArgs {
	permissions?: Permissions.Share[];
	checkRef?: boolean;
}

export const makeShareAuthMiddleware = ({ permissions, checkRef }: IShareAuthArgs): Middleware<IGraphQLContext> =>
	async ({ args, root, context }, next) => {
		try {
			const { services: { shareService }, scopes, userID } = context;
			const shareID = getShareIDFromRequest({ root, args });
			const shouldCheckShareRef = checkRef !== undefined ? checkRef : true;

			if (!shareID) {
				throw new Error('Share reference not found');
			}

			if (shouldCheckShareRef) {
				context.share = await shareService.getShareByID(shareID, userID!);
			}

			if (permissions) {
				const isPermitted = hasAllPermissions(
					permissions,
					getCurrentPermissionsForShare(shareID, scopes)
				);

				if (!isPermitted) {
					throw new ForbiddenError(`User has insufficient permissions to perform this action!`);
				}
			}

			return next();
		} catch (err) {
			if (err instanceof NoScopesProvidedError) {
				throw new ForbiddenError(`User has insufficient permissions to perform this action!`);
			}

			throw err;
		}
	};

type ShareAuth = {
	(args?: IShareAuthArgs): MethodAndPropDecorator;
	(permissions?: Permissions.Share[]): MethodAndPropDecorator;
}

// istanbul ignore next
export const ShareAuth: ShareAuth = (args?: IShareAuthArgs | Permissions.Share[]) => {
	if (args instanceof Array) {
		return UseMiddleware(makeShareAuthMiddleware({ permissions: args }));
	}

	return UseMiddleware(makeShareAuthMiddleware(args || {}));
};