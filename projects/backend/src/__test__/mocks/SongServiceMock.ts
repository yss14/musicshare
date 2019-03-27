import { ISongService } from "../../services/SongService";
import { Song } from "../../models/SongModel";
import { Share } from "../../models/ShareModel";
import { TimeUUID } from "../../types/TimeUUID";

export class SongServiceMock implements ISongService {
	public async getByID(shareID: string, songID: string): Promise<Song> {
		throw 'Not implemented yet';
	}

	public async getByShare(share: Share): Promise<Song[]> {
		throw 'Not implemented yet';
	}

	public async create(): Promise<string> {
		return TimeUUID.fromDate(new Date()).toString();
	}
}