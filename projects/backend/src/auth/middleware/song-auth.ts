import { Permissions } from '@musicshare/shared-types';
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { IGraphQLContext } from "../../types/context";
import { getShareIDFromRequest, hasAllPermissions, getCurrentPermissionsForShare, getSongIDFromRequest, NoScopesProvidedError } from "./auth-selectors";
import { UseMiddleware } from "type-graphql";
import { ForbiddenError } from "apollo-server-core";

export const makeSongAuthMiddleware = (permissions?: Permissions.Song[]): Middleware<IGraphQLContext> => async ({ args, root, context }, next) => {
	try {
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
	} catch (err) {
		if (err instanceof NoScopesProvidedError) {
			throw new ForbiddenError(`User has insufficient permissions to perform this action!`);
		}

		throw err;
	}
};

export const SongAuth = (permissions?: Permissions.Song[]) => UseMiddleware(makeSongAuthMiddleware(permissions));