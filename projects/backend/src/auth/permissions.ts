// istanbul ignore next
export namespace Permissions {
	const songPermissions = ['song:upload', 'song:modify'] as const;
	export type Song = (typeof songPermissions)[number];

	const playlistPermissions = ['playlist:create', 'playlist:modify', 'playlist:mutate_songs'] as const;
	export type Playlist = (typeof playlistPermissions)[number];

	const sharePermissions = ['share:member'] as const;
	export type Share = (typeof sharePermissions)[number];

	export const ALL = [...songPermissions, ...playlistPermissions, ...sharePermissions];

	export const isPermission = (obj: any): obj is Permission => ALL.includes(obj);
}

export type Permission = Permissions.Playlist | Permissions.Song | Permissions.Share;