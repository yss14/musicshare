import { Nullable } from "../../../types/Nullable";
import { ISong } from "../../../models/interfaces/ISong";
import { IFile } from "../../../models/interfaces/IFile";
import { ISongType } from "../../../models/interfaces/SongType";

export type ExtractedSongMetaData = Partial<Nullable<ISong>>

export interface ISongMetaDataSource {
	isApplicableForFile(file: IFile): boolean;
	analyse(file: IFile, audioBuffer: Buffer, songTypes: ISongType[]): Promise<ExtractedSongMetaData>;
}