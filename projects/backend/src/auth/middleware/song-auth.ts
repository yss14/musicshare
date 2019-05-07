import { Permissions } from "../permissions";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { IGraphQLContext } from "../../types/context";
import { getShareIDFromRequest, hasAllPermissions, getCurrentPermissionsForShare, getSongIDFromRequest } from "./auth-selectors";
import { UseMiddleware } from "type-graphql";

const makeSongAuthMiddleware = (permissions?: Permissions.Song[]): Middleware<IGraphQLContext> => async ({ args, root, context }, next) => {
	const { services: { songService }, scopes } = context;
	const songID = getSongIDFromRequest({ root, args });
	const shareID = getShareIDFromRequest({ root, args });

	if (!songID) {
		throw new Error('Song reference not found');
	}
	if (!shareID) {
		throw new Error('Share reference not found');
	}

	await songService.getByID(shareID, songID);

	if (permissions) {
		const isPermitted = hasAllPermissions(
			permissions,
			getCurrentPermissionsForShare(shareID, scopes),
		);

		if (!isPermitted) {
			throw new Error(`User has insufficient permissions to perform this action!`);
		}
	}

	return next();
};

export const SongAuth = (permissions?: Permissions.Song[]) => UseMiddleware(makeSongAuthMiddleware(permissions));