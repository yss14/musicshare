import { FileSourceType, FileSource, FileUpload } from "./FileSourceModels"
import { ObjectType, Field, Int } from "type-graphql"
import { plainToClass } from "class-transformer"
import moment from "moment"
import { filterNull } from "../utils/array/filter-null"
import { IShareSongsViewDBResult } from "../database/views"

const mapFileSourceModel = (entry: FileSourceType): FileSourceType | null => {
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

export const isSongDBResultWithPlayCount = <T>(obj: T): obj is T & { play_count: number } =>
	typeof obj === "object" && typeof (obj as any).play_count === "number"

@ObjectType({ description: "This represents the base of song and its properties" })
export class BaseSong {
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

	@Field(() => [String])
	public readonly labels!: string[]

	@Field(() => [FileSource])
	public readonly sources!: FileSourceType[]

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

	@Field(() => Int)
	public readonly numberOfSources!: number

	public static fromDBResult(row: IShareSongsViewDBResult): BaseSong {
		return plainToClass(BaseSong, <BaseSong>{
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
			libraryID: row.library_id_ref,
			playCount: isSongDBResultWithPlayCount(row) ? row.play_count : 0,
			numberOfSources: row.sources.data.length,
		})
	}
}

@ObjectType({ description: "A song belonging to a share. If it belongs to a library, libraryID = shareID" })
export class ShareSong extends BaseSong {
	@Field(() => String)
	public readonly shareID!: string

	public static fromDBResult(row: IShareSongsViewDBResult): ShareSong {
		const baseSong = BaseSong.fromDBResult(row)

		return plainToClass(ShareSong, <ShareSong>{
			...baseSong,
			shareID: row.share_id_ref,
		})
	}
}
