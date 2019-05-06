import { Permissions } from "../permissions";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { IGraphQLContext } from "../../types/context";
import { getPlaylistIDFromRequest, getShareIDFromRequest, hasAllPermissions, getRequiredPermissionsForShare } from "./auth-selectors";
import { UseMiddleware } from "type-graphql";

const makePlaylistAuthMiddleware = (permissions?: Permissions.Playlist[]): Middleware<IGraphQLContext> => async ({ args, root, context }, next) => {
	const { services: { playlistService }, scopes } = context;
	const playlistID = getPlaylistIDFromRequest({ root, args });
	const shareID = getShareIDFromRequest({ root, args });

	if (!playlistID) {
		throw new Error('Playlist reference not found');
	}
	if (!shareID) {
		throw new Error('Share reference not found');
	}

	await playlistService.getByID(shareID, playlistID);

	if (permissions) {
		const isPermitted = hasAllPermissions(
			getRequiredPermissionsForShare(shareID, scopes),
			permissions
		);

		if (!isPermitted) {
			throw new Error(`User has insufficient permissions to perform this action!`);
		}
	}

	return next();
};

export const PlaylistAuth = (permissions?: Permissions.Playlist[]) => UseMiddleware(makePlaylistAuthMiddleware(permissions));