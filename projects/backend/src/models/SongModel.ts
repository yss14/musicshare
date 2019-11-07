import { FileSource, FileUpload } from './FileSourceModels';
import { ObjectType, Field } from "type-graphql";
import { Share } from "./ShareModel";
import { Nullable } from '../types/Nullable';
import { ISong } from './interfaces/ISong';
import { plainToClass } from 'class-transformer';
import { IShareSongDBResult, ISongDBResult } from '../database/schema/tables';
import moment = require('moment');
import { filterNull } from '../utils/array/filter-null'

const isShareSongDBResult = (obj: any): obj is IShareSongDBResult => typeof obj.share_id_ref === 'string';

const mapFileSourceModel = (entry: FileSource): FileSource | null => {
	if (entry.fileExtension && entry.blob && entry.container) {
		return plainToClass(
			FileUpload,
			{
				container: entry.container,
				blob: entry.blob,
				fileExtension: entry.fileExtension,
				originalFilename: entry.originalFilename,
			}
		)
	}

	return null
}

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

	@Field(() => [FileSource])
	public readonly sources!: FileSource[];

	@Field()
	public readonly fileUploadAccessUrl!: string;

	@Field()
	public readonly duration!: number;

	@Field(type => [String])
	public readonly tags!: string[];

	@Field(type => String)
	public readonly dateAdded!: string;

	@Field(type => String)
	public readonly libraryID!: string;

	public static fromDBResult(row: ISongDBResult, libraryID: string): Song;
	public static fromDBResult(row: IShareSongDBResult): Song;
	public static fromDBResult(row: ISongDBResult | IShareSongDBResult, libraryID?: string) {
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
				sources: row.sources.data
					.map(mapFileSourceModel)
					.filter(filterNull),
				duration: row.duration,
				tags: row.tags || [],
				dateAdded: row.date_added.toISOString(),
				libraryID: isShareSongDBResult(row) ? row.share_id_ref : libraryID,
			}
		)
	}
}
