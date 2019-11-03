import { Scopes } from "../../types/context";
import { ArgsDictionary } from "type-graphql";
import { Share } from "../../models/ShareModel";
import { Playlist } from "../../models/PlaylistModel";
import { Song } from "../../models/SongModel";

export const hasAllPermissions = (requiredPermissions: string[], currentPermissions: string[]) => {
	return !requiredPermissions.some(requiredPermission => !currentPermissions.includes(requiredPermission));
}

export class NoScopesProvidedError extends Error {
	constructor(shareID: string) {
		super(`No scopes provided for share ${shareID}`)
	}
}

export const getCurrentPermissionsForShare = (shareID: string, scopes: Scopes) => {
	const shareScopes = scopes.find(scope => scope.shareID === shareID);

	if (!shareScopes) {
		throw new NoScopesProvidedError(shareID);
	}

	return shareScopes.permissions;
}

export const getShareIDFromRequest = ({ args, root }: { args: ArgsDictionary, root: any }) => {
	if (root instanceof Share) {
		return root.id;
	}

	if (root instanceof Playlist) {
		return root.shareID;
	}

	if (typeof args.shareID === 'string') {
		return args.shareID;
	}

	return null;
}

export const getPlaylistIDFromRequest = ({ args, root }: { args: ArgsDictionary, root: any }) => {
	if (root instanceof Playlist) {
		return root.id;
	}

	if (typeof args.playlistID === 'string') {
		return args.playlistID;
	}

	return null;
}

export const getSongIDFromRequest = ({ args, root }: { args: ArgsDictionary, root: any }) => {
	if (root instanceof Song) {
		return root.id;
	}

	if (typeof args.songID === 'string') {
		return args.songID;
	}

	return null;
}