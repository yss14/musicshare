import { IUploadedFile } from "../../../job-queues/SongUploadProcessingQueue";
import { Nullable } from "../../../types/Nullable";
import { ISong } from "../../../models/interfaces/ISong";

export type ExtractedSongMetaData = Partial<Nullable<ISong>>

export interface ISongMetaDataSource {
	isApplicableForFile(file: IUploadedFile): boolean;
	analyse(file: IUploadedFile, audioBuffer: Buffer): Promise<ExtractedSongMetaData>;
}