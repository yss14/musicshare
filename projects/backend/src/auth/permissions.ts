export namespace Permissions {
	export type Song = 'song:upload' | 'song:modify';

	export type Playlist = 'playlist:create' | 'playlist:modify' | 'playlist:mutate_songs';

	export const allPermissions = <P>(permissionType: P): string[] =>
		Object.values(permissionType);
}

export type Permission = Permissions.Playlist | Permissions.Song;