export namespace Permissions {
	export type Song = 'upload' | 'modify';

	export type Playlist = 'create' | 'modify' | 'mutate_songs';

	export const allPermissions = <P>(permissionType: P): string[] =>
		Object.values(permissionType);
}

export type Permission = Permissions.Playlist | Permissions.Playlist;