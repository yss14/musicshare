import { ISongMetaDataSource, ExtractedSongMetaData } from "./song-meta-formats/ISongMetaDataSource"
import { objectKeys } from "../object/object-keys"
import { IFile } from "../../models/interfaces/IFile"
import { ISongTypeWithoutID } from "../../models/interfaces/SongType"
import { IGenreWithoutID } from "../../models/interfaces/Genre"

export interface ISongMetaDataService {
	analyse(
		file: IFile,
		audioBuffer: Buffer,
		songTypes: ISongTypeWithoutID[],
		genres: IGenreWithoutID[],
	): Promise<ExtractedSongMetaData>
}

export class SongMetaDataService implements ISongMetaDataService {
	constructor(private readonly metaDataSources: ISongMetaDataSource[]) {}

	public async analyse(file: IFile, audioBuffer: Buffer, songTypes: ISongTypeWithoutID[], genres: IGenreWithoutID[]) {
		let extractedMetaData: ExtractedSongMetaData = {}

		for (const metaDataSource of this.metaDataSources) {
			if (metaDataSource.isApplicableForFile(file)) {
				const metaData = await metaDataSource.analyse(file, audioBuffer, songTypes, genres)

				extractedMetaData = this.mergeMetaData(extractedMetaData, metaData)
			}
		}

		return extractedMetaData
	}

	private mergeMetaData(lhs: ExtractedSongMetaData, rhs: ExtractedSongMetaData): ExtractedSongMetaData {
		let mergedMetaData = { ...lhs }

		objectKeys(rhs)
			.filter((key) => rhs[key] !== null && rhs[key] !== undefined)
			.forEach((key) => {
				const currentValue = mergedMetaData[key]
				const newValue = rhs[key]

				if (currentValue instanceof Array && newValue instanceof Array) {
					;(mergedMetaData[key] as any) = [...currentValue, ...newValue]
				} else {
					;(mergedMetaData[key] as any) = newValue
				}
			})

		return mergedMetaData
	}
}
