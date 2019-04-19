import { ISongService } from "../../services/SongService";
import { Song } from "../../models/SongModel";
import { TimeUUID } from "../../types/TimeUUID";

export class SongServiceMock implements ISongService {
	public async getByID(shareID: string, songID: string): Promise<Song> {
		throw 'Not implemented yet';
	}

	public async getByShare(shareID: string): Promise<Song[]> {
		throw 'Not implemented yet';
	}

	public async create(): Promise<string> {
		return TimeUUID(new Date()).toString();
	}

	public async update() {
		throw 'Not implemented yet';
	}
}