import { Nullable } from "../../../types/Nullable"
import { IBaseSong } from "@musicshare/shared-types"
import { IFile } from "../../../models/interfaces/IFile"
import { ISongType } from "../../../models/interfaces/SongType"

export type ExtractedSongMetaData = Partial<Nullable<IBaseSong>>

export interface ISongMetaDataSource {
	isApplicableForFile(file: IFile): boolean
	analyse(file: IFile, audioBuffer: Buffer, songTypes: ISongType[]): Promise<ExtractedSongMetaData>
}
