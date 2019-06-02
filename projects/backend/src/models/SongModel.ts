import { File } from './FileModel';
import { ObjectType, Field } from "type-graphql";
import { Share } from "./ShareModel";
import { Nullable } from '../types/Nullable';
import { ISong } from './interfaces/ISong';
import { plainToClass } from 'class-transformer';
import { ISongDBResult } from '../database/schema/tables';
import moment = require('moment');

@ObjectType({ description: 'This represents a song and its properties' })
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

	@Field(type => String)
	public readonly dateLastEdit!: string;

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

	@Field(type => String)
	public readonly dateAdded!: string;

	public static fromDBResult(row: ISongDBResult) {
		return plainToClass(
			Song,
			{
				id: row.song_id,
				title: row.title,
				suffix: row.suffix,
				year: row.year,
				bpm: row.bpm,
				dateLastEdit: row.date_last_edit.toISOString(),
				releaseDate: row.release_date ? moment(row.release_date).format('YYYY-MM-DD') : null,
				isRip: row.is_rip,
				artists: row.artists || [],
				remixer: row.remixer || [],
				featurings: row.featurings || [],
				type: row.type,
				genres: row.genres || [],
				labels: row.labels || [],
				file: row.file,
				duration: row.duration,
				tags: row.tags || [],
				dateAdded: row.date_added.toISOString(),
			}
		)
	}
}
