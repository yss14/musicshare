import { IExtractedSongMeta } from "../../id3-parser";

export interface ISongMetaDataFormat {
	analyse(originalFilename: string, extension: string, audioBuffer: Buffer): Promise<IExtractedSongMeta>;
}