import { ISongService } from "../../services/SongService";
import { Song } from "../../models/SongModel";
import { v4 as uuid } from 'uuid';

export class SongServiceMock implements ISongService {
	public async getByID(shareID: string, songID: string): Promise<Song> {
		throw 'Not implemented yet';
	}

	public async getByShare(shareID: string): Promise<Song[]> {
		throw 'Not implemented yet';
	}

	public async getByShareDirty(shareID: string, lastTimestamp: number): Promise<Song[]> {
		throw 'Not implemented yet';
	}

	public async create(): Promise<string> {
		return uuid();
	}

	public async update() {
		throw 'Not implemented yet';
	}
}