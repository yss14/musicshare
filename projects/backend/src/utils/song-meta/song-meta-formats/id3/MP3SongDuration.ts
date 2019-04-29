import { ISongMetaDataSource, ExtractedSongMetaData } from "../ISongMetaDataSource";
import { IFile } from "../../../../models/interfaces/IFile";
import { ISongType } from "../../../../models/interfaces/SongType";
const mp3Duration = require('mp3-duration');

export class MP3SongDuration implements ISongMetaDataSource {
	public isApplicableForFile(file: IFile) {
		return file.fileExtension.toLowerCase() === 'mp3';
	}

	public async analyse(file: IFile, audioBuffer: Buffer, songTypes: ISongType[]): Promise<ExtractedSongMetaData> {
		const duration = await this.getSongDurationFromBuffer(audioBuffer);

		if (duration) {
			return { duration: Math.ceil(duration) };
		}

		return {};
	}

	private async getSongDurationFromBuffer(audioBuffer: Buffer): Promise<number | null> {
		try {
			const duration = await mp3Duration(audioBuffer);

			return duration;
		} catch (err) /* istanbul ignore next */ {
			console.error(err);

			return null;
		}
	}
}