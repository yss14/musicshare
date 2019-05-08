import { Permissions } from "../permissions";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { IGraphQLContext } from "../../types/context";
import { getPlaylistIDFromRequest, getShareIDFromRequest, hasAllPermissions, getCurrentPermissionsForShare } from "./auth-selectors";
import { UseMiddleware } from "type-graphql";
import { MethodAndPropDecorator } from "type-graphql/dist/decorators/types";

interface IPlaylistAuthArgs {
	permissions?: Permissions.Playlist[];
	checkRef?: boolean;
}

export const makePlaylistAuthMiddleware = ({ permissions, checkRef }: IPlaylistAuthArgs): Middleware<IGraphQLContext> =>
	async ({ args, root, context }, next) => {
		const { services: { playlistService }, scopes } = context;
		const playlistID = getPlaylistIDFromRequest({ root, args });
		const shareID = getShareIDFromRequest({ root, args });
		const shouldCheckPlaylistRef = checkRef !== undefined ? checkRef : true;

		if (!shareID) {
			throw new Error('Share reference not found');
		}

		if (shouldCheckPlaylistRef) {
			if (!playlistID) {
				throw new Error('Playlist reference not found');
			}

			await playlistService.getByID(shareID, playlistID);
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

type PlaylistAuth = {
	(args?: IPlaylistAuthArgs): MethodAndPropDecorator;
	(permissions?: Permissions.Playlist[]): MethodAndPropDecorator;
}

export const PlaylistAuth: PlaylistAuth = (args?: IPlaylistAuthArgs | Permissions.Playlist[]) => {
	if (args instanceof Array) {
		return UseMiddleware(makePlaylistAuthMiddleware({ permissions: args }));
	}

	return UseMiddleware(makePlaylistAuthMiddleware(args || {}))
};