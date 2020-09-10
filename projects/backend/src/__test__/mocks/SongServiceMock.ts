import { ISongService } from "../../services/SongService"
import { ShareSong } from "../../models/SongModel"
import { v4 as uuid } from "uuid"
import { Share } from "../../models/ShareModel"

export class SongServiceMock implements ISongService {
	public async getByID(): Promise<ShareSong> {
		throw "Not implemented yet"
	}

	public async getByShare(): Promise<ShareSong[]> {
		throw "Not implemented yet"
	}

	public async getSongOriginLibrary(): Promise<Share | null> {
		throw "Not implemented yet"
	}

	public async hasReadAccessToSongs(): Promise<boolean> {
		throw "Not implemented yet"
	}

	public async hasWriteAccessToSongs(): Promise<boolean> {
		throw "Not implemented yet"
	}

	public async getByShareDirty(): Promise<ShareSong[]> {
		throw "Not implemented yet"
	}

	public async create(): Promise<string> {
		return uuid()
	}

	public async update() {
		throw "Not implemented yet"
	}

	public async searchSongs(): Promise<ShareSong[]> {
		throw "Not implemented yet"
	}

	public async removeSongFromLibrary(): Promise<any> {
		throw "Not implemented yet"
	}

	public async increasePlayCount(): Promise<void> {
		throw "Not implemented yet"
	}

	public async addLibrarySongsToShare(): Promise<void> {
		throw "Not implemented yet"
	}

	public async findSongFileDuplicates(): Promise<ShareSong[]> {
		throw "Not implemented yet"
	}

	public async findNearDuplicateSongs(): Promise<ShareSong[]> {
		throw "Not implemented yet"
	}
}
