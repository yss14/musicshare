import { Nullable } from "../../../types/Nullable"
import { BaseSong } from "@musicshare/shared-types"
import { IFile } from "../../../models/interfaces/IFile"
import { ISongTypeWithoutID } from "../../../models/interfaces/SongType"

export type ExtractedSongMetaData = Partial<Nullable<BaseSong>>

export interface ISongMetaDataSource {
	isApplicableForFile(file: IFile): boolean
	analyse(file: IFile, audioBuffer: Buffer, songTypes: ISongTypeWithoutID[]): Promise<ExtractedSongMetaData>
}
