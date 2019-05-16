import { File } from './FileModel';
import { ObjectType, Field, Int } from "type-graphql";
import { Share } from "./ShareModel";
import { Nullable } from '../types/Nullable';
import { ISong } from './interfaces/ISong';
import { plainToClass } from 'class-transformer';
import { ISongByShareDBResult, ISongByPlaylistDBResult, ISongBaseDBResult } from '../database/schema/tables';

@ObjectType({ description: 'This represents a base song and its properties' })
export class Song implements Nullable<ISong>{
	@Field()
	public readonly id!: string;

	@Field()
	public readonly title!: string;

	@Field(type => String, { nullable: true })
	public readonly suffix!: string | null;

	@Field(type => Number, { nullable: true })
	public readonly year!: number | null;

	@Field(type => Number, { nullable: true })
	public readonly bpm!: number | null;

	@Field(type => Number)
	public readonly dateLastEdit!: number;

	@Field(type => String, { nullable: true })
	public readonly releaseDate!: string | null;

	@Field()
	public readonly isRip!: boolean;

	@Field(type => [String])
	public readonly artists!: string[];

	@Field(type => [String])
	public readonly remixer!: string[];

	@Field(type => [String])
	public readonly featurings!: string[];

	@Field(type => String, { nullable: true })
	public readonly type!: string | null;

	@Field(type => [String])
	public readonly genres!: string[];

	@Field(type => String)
	public readonly labels!: string[];

	@Field(() => Share)
	public readonly share!: Share;

	@Field(() => File)
	public readonly file!: File;

	@Field()
	public readonly accessUrl!: string;

	@Field()
	public readonly duration!: number;

	@Field(type => [String])
	public readonly tags!: string[];
}

@ObjectType({ description: 'This represents a song which is part of a library or share' })
export class ShareSong extends Song implements Nullable<ISong>{
	@Field()
	public readonly requiresUserAction!: boolean;
}

// istanbul ignore next
const songMapper = (row: ISongBaseDBResult) => ({
	id: row.song_id.toString(),
	title: row.title,
	suffix: row.suffix,
	year: row.year,
	bpm: row.bpm,
	dateLastEdit: row.date_last_edit.getTime(),
	releaseDate: row.release_date ? row.release_date.toString() : null,
	isRip: row.is_rip,
	artists: row.artists || [],
	remixer: row.remixer || [],
	featurings: row.featurings || [],
	type: row.type,
	genres: row.genres || [],
	labels: row.labels || [],
	file: row.file ? JSON.parse(row.file) : {},
	duration: row.duration,
	tags: row.tags || [],
});

const shareSongMapper = (row: ISongByShareDBResult) => ({
	...songMapper(row),
	requiresUserAction: row.requires_user_action,
})

export const shareSongFromDBResult = (row: ISongByShareDBResult): ShareSong => plainToClass(
	ShareSong,
	shareSongMapper(row)
)

@ObjectType({ description: 'This represents a song which is part of a playlist' })
export class PlaylistSong extends Song {
	@Field()
	public readonly playlistID!: string;

	@Field(() => Int)
	public readonly position!: number;

	@Field()
	public readonly dateAdded!: Date;
}

const playlistSongMapper = (row: ISongByPlaylistDBResult) => ({
	...songMapper(row),
	playlistID: row.playlist_id.toString(),
	position: row.position,
	dateAdded: row.date_added,
});

export const playlistSongFromDBResult = (row: ISongByPlaylistDBResult): PlaylistSong => plainToClass(
	PlaylistSong,
	playlistSongMapper(row)
)