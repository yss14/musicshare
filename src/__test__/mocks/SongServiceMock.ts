import { ISongService } from "../../services/SongService";
import { Song } from "../../models/SongModel";
import { Share } from "../../models/ShareModel";
import { ISongByShareDBInsert } from "../../database/schema/initial-schema";
import { TimeUUID } from "../../types/TimeUUID";

export class SongServiceMock implements ISongService {
	public async getByID(shareID: string, songID: string): Promise<Song> {
		throw 'Not implemented yet';
	}

	public async getByShare(share: Share): Promise<Song[]> {
		throw 'Not implemented yet';
	}

	public async create(song: ISongByShareDBInsert): Promise<string> {
		return TimeUUID.fromDate(new Date()).toString();
	}
}