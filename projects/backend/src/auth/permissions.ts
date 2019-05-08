// istanbul ignore next
export namespace Permissions {
	export type Song = 'song:upload' | 'song:modify';
	export type Playlist = 'playlist:create' | 'playlist:modify' | 'playlist:mutate_songs';
	export type Share = 'share:member';
}

export type Permission = Permissions.Playlist | Permissions.Song;