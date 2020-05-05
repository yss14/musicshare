import { FileSource, FileUpload } from "./FileSourceModels"
import { ObjectType, Field, Int } from "type-graphql"
import { Nullable } from "../types/Nullable"
import { ISong } from "./interfaces/ISong"
import { plainToClass } from "class-transformer"
import { ISongDBResult } from "../database/tables"
import moment from "moment"
import { filterNull } from "../utils/array/filter-null"
import { connectionTypes } from "../relay/relay"

const mapFileSourceModel = (entry: FileSource): FileSource | null => {
	if (entry.fileExtension && entry.blob && entry.container) {
		return plainToClass(FileUpload, {
			container: entry.container,
			blob: entry.blob,
			fileExtension: entry.fileExtension,
			originalFilename: entry.originalFilename,
		})
	}

	return null
}

export type ISongDBResultWithLibrary = ISongDBResult & { library_id: string }

const isSongDBResultWithLibrary = (obj: any): obj is ISongDBResultWithLibrary =>
	typeof obj === "object" && typeof obj.library_id === "string"

export const isSongDBResultWithPlayCount = <T>(obj: T): obj is T & { play_count: number } =>
	typeof obj === "object" && typeof (obj as any).play_count === "number"

@ObjectType({ description: "This represents a song and its properties" })
export class Song implements Nullable<ISong> {
	@Field()
	public readonly id!: string

	@Field()
	public readonly title!: string

	@Field(() => String, { nullable: true })
	public readonly suffix!: string | null

	@Field(() => Number, { nullable: true })
	public readonly year!: number | null

	@Field(() => Number, { nullable: true })
	public readonly bpm!: number | null

	@Field(() => String)
	public readonly dateLastEdit!: string

	@Field(() => String, { nullable: true })
	public readonly releaseDate!: string | null

	@Field()
	public readonly isRip!: boolean

	@Field(() => [String])
	public readonly artists!: string[]

	@Field(() => [String])
	public readonly remixer!: string[]

	@Field(() => [String])
	public readonly featurings!: string[]

	@Field(() => String, { nullable: true })
	public readonly type!: string | null

	@Field(() => [String])
	public readonly genres!: string[]

	@Field(() => String)
	public readonly labels!: string[]

	@Field(() => [FileSource])
	public readonly sources!: FileSource[]

	@Field()
	public readonly fileUploadAccessUrl!: string

	@Field()
	public readonly duration!: number

	@Field(() => [String])
	public readonly tags!: string[]

	@Field(() => String)
	public readonly dateAdded!: string

	@Field(() => String)
	public readonly libraryID!: string

	@Field(() => Int)
	public readonly playCount!: number

	public static fromDBResult(row: ISongDBResultWithLibrary): Song
	public static fromDBResult(row: ISongDBResult, libraryID: string): Song
	public static fromDBResult(row: ISongDBResult, libraryID?: string): Song {
		return plainToClass(Song, {
			id: row.song_id,
			title: row.title,
			suffix: row.suffix,
			year: row.year,
			bpm: row.bpm,
			dateLastEdit: row.date_last_edit.toISOString(),
			releaseDate: row.release_date ? moment(row.release_date).format("YYYY-MM-DD") : null,
			isRip: row.is_rip,
			artists: row.artists || [],
			remixer: row.remixer || [],
			featurings: row.featurings || [],
			type: row.type,
			genres: row.genres || [],
			labels: row.labels || [],
			sources: row.sources.data.map(mapFileSourceModel).filter(filterNull),
			duration: row.duration,
			tags: row.tags || [],
			dateAdded: row.date_added.toISOString(),
			libraryID: isSongDBResultWithLibrary(row) ? row.library_id : libraryID,
			playCount: isSongDBResultWithPlayCount(row) ? row.play_count : 0,
		})
	}
}

const { Connection, Edge } = connectionTypes("Song", Song)

export const SongConnection = Connection
export const SongEdge = Edge
