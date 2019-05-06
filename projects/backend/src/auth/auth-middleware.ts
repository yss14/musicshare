import { HTTPStatusCodes } from '../types/http-status-codes';
import { IAuthenticationService } from './AuthenticationService';
import { CustomRequestHandler, Scopes, IGraphQLContext } from '../types/context';
import { AuthChecker, UseMiddleware, ArgsDictionary } from 'type-graphql';
import { Permissions } from './permissions';
import { Share } from '../models/ShareModel';
import { Playlist } from '../models/PlaylistModel';
import { Middleware } from 'type-graphql/dist/interfaces/Middleware';

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

export const graphQLAuthChecker: AuthChecker<IGraphQLContext> = ({ context: { userID, scopes }, root, args }, permissions) => {
	if (permissions.length === 0) {
		return userID !== null && userID !== undefined;
	}

	if (!userID) {
		return false;
	}

	return true;
};

const hasAllPermissions = (requiredPermissions: string[], currentPermissions: string[]) => {
	return !requiredPermissions.some(requiredPermission => !currentPermissions.includes(requiredPermission));
}

const getRequiredPermissionsForShare = (shareID: string, scopes: Scopes) => {
	const shareScopes = scopes.find(scope => scope.shareID === shareID);

	if (!shareScopes) {
		throw new Error(`No scopes provided for share ${shareID}`);
	}

	return shareScopes.permissions;
}

const getShareIDFromRequest = ({ args, root }: { args: ArgsDictionary, root: any }) => {
	if (root instanceof Share) {
		return root.id;
	}

	if (typeof args.shareID === 'string') {
		return args.shareID;
	}

	return null;
}

const getPlaylistIDFromRequest = ({ args, root }: { args: ArgsDictionary, root: any }) => {
	if (root instanceof Playlist) {
		return root.id;
	}

	if (typeof args.playlistID === 'string') {
		return args.playlistID;
	}

	return null;
}

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