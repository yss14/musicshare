import { Permissions } from "../permissions";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { IGraphQLContext } from "../../types/context";
import { getShareIDFromRequest, hasAllPermissions, getCurrentPermissionsForShare } from "./auth-selectors";
import { UseMiddleware } from "type-graphql";
import { MethodAndPropDecorator } from "type-graphql/dist/decorators/types";

interface IShareAuthArgs {
	permissions?: Permissions.Share[];
	checkRef?: boolean;
}

const makeShareAuthMiddleware = ({ permissions, checkRef }: IShareAuthArgs): Middleware<IGraphQLContext> =>
	async ({ args, root, context }, next) => {
		const { services: { shareService }, scopes, userID } = context;
		const shareID = getShareIDFromRequest({ root, args });
		const shouldCheckShareRef = checkRef !== undefined ? checkRef : true;

		if (!shareID) {
			throw new Error('Share reference not found');
		}

		if (shouldCheckShareRef) {
			await shareService.getShareByID(shareID, userID!);
		}

		if (permissions) {
			const isPermitted = hasAllPermissions(
				permissions,
				getCurrentPermissionsForShare(shareID, scopes)
			);

			if (!isPermitted) {
				throw new Error(`User has insufficient permissions to perform this action!`);
			}
		}

		return next();
	};

type ShareAuth = {
	(args?: IShareAuthArgs): MethodAndPropDecorator;
	(permissions?: Permissions.Share[]): MethodAndPropDecorator;
}

export const ShareAuth: ShareAuth = (args?: IShareAuthArgs | Permissions.Share[]) => {
	if (args instanceof Array) {
		return UseMiddleware(makeShareAuthMiddleware({ permissions: args }));
	}

	return UseMiddleware(makeShareAuthMiddleware(args || {}));
};