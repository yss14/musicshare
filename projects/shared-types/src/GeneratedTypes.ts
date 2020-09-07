/* eslint-disable */
/* tslint-disable */
// @ts-nocheck
// *******************************************************
// *******************************************************
//
// GENERATED FILE, DO NOT MODIFY
//
// Made by Victor Garcia ®
//
// https://github.com/victorgarciaesgi
// *******************************************************
// *******************************************************
// 💙

export type Maybe<T> = T | null

export interface Query {
	viewer: Maybe<Viewer>
	share: Share
}

/** Object representing the viewer */
export interface Viewer {
	id: string
	name: string
	email: string
	shares: Share[]
	artists: Artist[]
	genres: Genre[]
	songTypes: SongType[]
	tags: string[]
	searchSongs: ShareSong[]
	findSongFileDuplicates: ShareSong[]
}

export interface IUser {
	id: string
	name: string
	email: string
}

/** Object representing a share or a personal library */
export interface Share {
	id: string
	name: string
	isLibrary: boolean
	songs: ShareSong[]
	songsDirty: TimestampedResult
	song: ShareSong
	playlists: Playlist[]
	playlist: Playlist
	members: ShareMember[]
	permissions: string[]
	userPermissions: string[]
}

/** A song belonging to a share. If it belongs to a library, libraryID = shareID */
export interface ShareSong {
	id: string
	title: string
	suffix: Maybe<string>
	year: Maybe<number>
	bpm: Maybe<number>
	dateLastEdit: string
	releaseDate: Maybe<string>
	isRip: boolean
	artists: string[]
	remixer: string[]
	featurings: string[]
	type: Maybe<string>
	genres: string[]
	labels: string[]
	sources: FileSource[]
	duration: number
	tags: string[]
	dateAdded: string
	libraryID: string
	playCount: number
	numberOfSources: number
	shareID: string
}

/** This represents file meta data for an uploaded song */
export interface FileUpload {
	container: string
	blob: string
	fileExtension: string
	originalFilename: string
	hash: string
	accessUrl: string
}

export interface TimestampedResult {
	timestamp: string
	nodes: ShareSong[]
}

/** This represents a playlist */
export interface Playlist {
	id: string
	name: string
	dateAdded: string
	shareID: string
	songs: PlaylistSong[]
}

export interface PlaylistSong {
	id: string
	title: string
	suffix: Maybe<string>
	year: Maybe<number>
	bpm: Maybe<number>
	dateLastEdit: string
	releaseDate: Maybe<string>
	isRip: boolean
	artists: string[]
	remixer: string[]
	featurings: string[]
	type: Maybe<string>
	genres: string[]
	labels: string[]
	sources: FileSource[]
	duration: number
	tags: string[]
	dateAdded: string
	libraryID: string
	playCount: number
	numberOfSources: number
	shareID: string
	playlistSongID: string
	position: number
}

/** Object representing a share member */
export interface ShareMember {
	id: string
	name: string
	email: string
	dateJoined: string
	shareID: string
	permissions: string[]
	status: UserStatus
}

/** This represents an artist */
export interface Artist {
	name: string
}

/** This represents a song genre */
export interface Genre {
	name: string
	group: string
}

/** This represents a song song */
export interface SongType {
	name: string
	group: string
	hasArtists: boolean
	alternativeNames: string[]
}

export interface Mutation {
	login: AuthTokenBundle
	changePassword: boolean
	/** Returns new restore token*/
	restorePassword: string
	/** Issue a new authToken after the old one was invalidated*/
	issueAuthToken: string
	createShare: Share
	renameShare: Share
	deleteShare: boolean
	/** Returns an invitation link or null if user already existed and has been added to the share*/
	inviteToShare: Maybe<string>
	acceptInvitation: AcceptInviationPayload
	revokeInvitation: boolean
	leaveShare: boolean
	updateSong: Maybe<ShareSong>
	/** Removes a song from a library. If the song is referenced by entities from other shares, the song is copied to a linked library an referenced from there.*/
	removeSongFromLibrary: boolean
	incrementSongPlayCount: SongPlay
	submitSongFromRemoteFile: boolean
	createPlaylist: Maybe<Playlist>
	/** Deletes an existing playlists. Does not check if playlist exists.*/
	deletePlaylist: boolean
	/** Renames an existing playlists. Does not check if playlist exists.*/
	renamePlaylist: boolean
	addSongsToPlaylist: PlaylistSong[]
	removeSongsFromPlaylist: PlaylistSong[]
	updateOrderOfPlaylist: PlaylistSong[]
	generateUploadableUrl: string
	/** Updates permissions of a user and returns the updated permission list*/
	updateShareMemberPermissions: ShareMember
}

/** This represents an auth token bundle received during the login process */
export interface AuthTokenBundle {
	authToken: string
	refreshToken: string
}

export interface ChangePasswordInput {
	/** Plain text, hashing takes place at server side*/
	oldPassword: string
	/** Plain text, hashing takes place at server side*/
	newPassword: string
}

export interface RestorePasswordInput {
	email: string
	restoreToken: string
	newPassword: string
}

export interface InviteToShareInput {
	shareID: string
	email: string
}

export interface AcceptInvitationInput {
	name: string
	password: string
	invitationToken: string
}

export interface AcceptInviationPayload {
	restoreToken: string
	user: Viewer
}

export interface RevokeInvitationInput {
	shareID: string
	userID: string
}

export interface ShareIDInput {
	shareID: string
}

export interface SongUpdateInput {
	title?: string
	suffix?: string
	year?: number
	bpm?: number
	releaseDate?: string
	isRip?: boolean
	artists?: string[]
	remixer?: string[]
	featurings?: string[]
	type?: string
	genres?: string[]
	labels?: string[]
	tags?: string[]
}

export interface RemoveSongFromLibraryInput {
	shareID: string
	songID: string
}

export interface IncrementSongPlayCountInput {
	shareID: string
	songID: string
}

export interface SongPlay {
	song: ShareSong
	user: Viewer
	dateAdded: string
}

export interface SubmitSongFromRemoteFileInput {
	filename: string
	remoteFileUrl: string
	playlistIDs: string[]
}

/** This represents the base of song and its properties */
export interface BaseSong {
	id: string
	title: string
	suffix: Maybe<string>
	year: Maybe<number>
	bpm: Maybe<number>
	dateLastEdit: string
	releaseDate: Maybe<string>
	isRip: boolean
	artists: string[]
	remixer: string[]
	featurings: string[]
	type: Maybe<string>
	genres: string[]
	labels: string[]
	sources: FileSource[]
	duration: number
	tags: string[]
	dateAdded: string
	libraryID: string
	playCount: number
	numberOfSources: number
}

export interface PageInfo {
	hasNextPage: boolean
	hasPreviousPage: boolean
	startCursor: string
	endCursor: string
}

export interface UserIDInput {
	userID: string
}

export type FileSource = FileUpload
/** Specifies whether a user already accepted an invitation or is still pending */
export enum UserStatus {
	Pending = "Pending",
	Accepted = "Accepted",
}
/** Specifies Which properties are to be searched */
export enum SongSearchMatcher {
	Title = "Title",
	Artists = "Artists",
	Tags = "Tags",
	Genres = "Genres",
	Labels = "Labels",
}
export interface viewerArgs {}

export interface shareArgs {
	shareID: string
}

export interface loginArgs {
	/** Plain text, hashing takes place at server side*/
	password: string
	email: string
}

export interface changePasswordArgs {
	input: ChangePasswordInput
}

/** Returns new restore token */
export interface restorePasswordArgs {
	input: RestorePasswordInput
}

/** Issue a new authToken after the old one was invalidated */
export interface issueAuthTokenArgs {
	refreshToken: string
}

export interface createShareArgs {
	name: string
}

export interface renameShareArgs {
	name: string
	shareID: string
}

export interface deleteShareArgs {
	shareID: string
}

/** Returns an invitation link or null if user already existed and has been added to the share */
export interface inviteToShareArgs {
	input: InviteToShareInput
}

export interface acceptInvitationArgs {
	input: AcceptInvitationInput
}

export interface revokeInvitationArgs {
	input: RevokeInvitationInput
}

export interface leaveShareArgs {
	input: ShareIDInput
}

export interface updateSongArgs {
	song: SongUpdateInput
	shareID: string
	songID: string
}

/** Removes a song from a library. If the song is referenced by entities from other shares, the song is copied to a linked library an referenced from there. */
export interface removeSongFromLibraryArgs {
	input: RemoveSongFromLibraryInput
}

export interface incrementSongPlayCountArgs {
	input: IncrementSongPlayCountInput
}

export interface submitSongFromRemoteFileArgs {
	input: SubmitSongFromRemoteFileInput
}

export interface createPlaylistArgs {
	name: string
	shareID: string
}

/** Deletes an existing playlists. Does not check if playlist exists. */
export interface deletePlaylistArgs {
	playlistID: string
	shareID: string
}

/** Renames an existing playlists. Does not check if playlist exists. */
export interface renamePlaylistArgs {
	newName: string
	playlistID: string
	shareID: string
}

export interface addSongsToPlaylistArgs {
	songIDs: string[]
	playlistID: string
	shareID: string
}

export interface removeSongsFromPlaylistArgs {
	playlistSongIDs: string[]
	playlistID: string
	shareID: string
}

export interface updateOrderOfPlaylistArgs {
	orderUpdates: [string, number][]
	playlistID: string
	shareID: string
}

export interface generateUploadableUrlArgs {
	fileExtension: string
}

/** Updates permissions of a user and returns the updated permission list */
export interface updateShareMemberPermissionsArgs {
	permissions: string[]
	shareID: string
	userID: string
}

export const ViewerFragment = sgtsQL` 
  fragment ViewerFragment on Viewer {
    id name email shares {id name isLibrary songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID } songsDirty {timestamp } playlists {id name dateAdded shareID songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels duration tags dateAdded libraryID playCount numberOfSources shareID playlistSongID position } } members {id name email dateJoined shareID permissions status } permissions userPermissions } artists {name } genres {name group } songTypes {name group hasArtists alternativeNames } tags 
  }
`
export const ShareFragment = sgtsQL` 
  fragment ShareFragment on Share {
    id name isLibrary songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID } songsDirty {timestamp } playlists {id name dateAdded shareID songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels duration tags dateAdded libraryID playCount numberOfSources shareID playlistSongID position } } members {id name email dateJoined shareID permissions status } permissions userPermissions 
  }
`
export const ShareSongFragment = sgtsQL` 
  fragment ShareSongFragment on ShareSong {
    id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID 
  }
`
export const FileUploadFragment = sgtsQL` 
  fragment FileUploadFragment on FileUpload {
    container blob fileExtension originalFilename hash accessUrl 
  }
`
export const TimestampedResultFragment = sgtsQL` 
  fragment TimestampedResultFragment on TimestampedResult {
    timestamp nodes {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID } 
  }
`
export const PlaylistFragment = sgtsQL` 
  fragment PlaylistFragment on Playlist {
    id name dateAdded shareID songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID playlistSongID position } 
  }
`
export const PlaylistSongFragment = sgtsQL` 
  fragment PlaylistSongFragment on PlaylistSong {
    id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID playlistSongID position 
  }
`
export const ShareMemberFragment = sgtsQL` 
  fragment ShareMemberFragment on ShareMember {
    id name email dateJoined shareID permissions status 
  }
`
export const ArtistFragment = sgtsQL` 
  fragment ArtistFragment on Artist {
    name 
  }
`
export const GenreFragment = sgtsQL` 
  fragment GenreFragment on Genre {
    name group 
  }
`
export const SongTypeFragment = sgtsQL` 
  fragment SongTypeFragment on SongType {
    name group hasArtists alternativeNames 
  }
`
export const AuthTokenBundleFragment = sgtsQL` 
  fragment AuthTokenBundleFragment on AuthTokenBundle {
    authToken refreshToken 
  }
`
export const AcceptInviationPayloadFragment = sgtsQL` 
  fragment AcceptInviationPayloadFragment on AcceptInviationPayload {
    restoreToken user {id name email shares {id name isLibrary songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID } songsDirty {timestamp } playlists {id name dateAdded shareID songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels duration tags dateAdded libraryID playCount numberOfSources shareID playlistSongID position } } members {id name email dateJoined shareID permissions status } permissions userPermissions } artists {name } genres {name group } songTypes {name group hasArtists alternativeNames } tags } 
  }
`
export const SongPlayFragment = sgtsQL` 
  fragment SongPlayFragment on SongPlay {
    song {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources shareID } user {id name email shares {id name isLibrary songsDirty {timestamp } playlists {id name dateAdded shareID songs {id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels duration tags dateAdded libraryID playCount numberOfSources shareID playlistSongID position } } members {id name email dateJoined shareID permissions status } permissions userPermissions } artists {name } genres {name group } songTypes {name group hasArtists alternativeNames } tags } dateAdded 
  }
`
export const BaseSongFragment = sgtsQL` 
  fragment BaseSongFragment on BaseSong {
    id title suffix year bpm dateLastEdit releaseDate isRip artists remixer featurings type genres labels sources {} duration tags dateAdded libraryID playCount numberOfSources 
  }
`
export const PageInfoFragment = sgtsQL` 
  fragment PageInfoFragment on PageInfo {
    hasNextPage hasPreviousPage startCursor endCursor 
  }
`
