// istanbul ignore next
export namespace Permissions {
	export const SONG_UPLOAD = "song:upload"
	export const SONG_MODIFY = "song:modify"
	const songPermissions = [SONG_UPLOAD, SONG_MODIFY] as const
	export type Song = typeof songPermissions[number]

	export const PLAYLIST_CREATE = "playlist:create"
	export const PLAYLIST_MODIFY = "playlist:modify"
	export const PLAYLIST_MUTATE_SONGS = "playlist:mutate_songs"
	const playlistPermissions = [PLAYLIST_CREATE, PLAYLIST_MODIFY, PLAYLIST_MUTATE_SONGS] as const
	export type Playlist = typeof playlistPermissions[number]

	export const SHARE_OWNER = "share:owner"
	const sharePermissions = [SHARE_OWNER] as const
	export type Share = typeof sharePermissions[number]

	export const ALL = [...songPermissions, ...playlistPermissions, ...sharePermissions]
	export const NONE = []
	export const NEW_MEMBER = [...songPermissions, ...playlistPermissions]

	export const isPermission = (obj: any): obj is Permission => ALL.includes(obj)
}

export type Permission = Permissions.Playlist | Permissions.Song | Permissions.Share
