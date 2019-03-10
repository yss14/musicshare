import { Nullable } from "../../../types/Nullable";
import { ISong } from "../../../models/interfaces/ISong";
import { IFile } from "../../../models/interfaces/IFile";

export type ExtractedSongMetaData = Partial<Nullable<ISong>>

export interface ISongMetaDataSource {
	isApplicableForFile(file: IFile): boolean;
	analyse(file: IFile, audioBuffer: Buffer): Promise<ExtractedSongMetaData>;
}