import { Artist } from "../models/ArtistModel";
import { ISongService } from "./SongService";
import { Song } from "../models/SongModel";
import { flatten } from "lodash";

export interface IArtistService {
	getArtistsForShare(shareID: string): Promise<Artist[]>;
	getArtistsForShares(shareIDs: string[]): Promise<Artist[]>;
}

export class ArtistService implements IArtistService {
	constructor(
		private readonly songService: ISongService,
	) { }

	public async getArtistsForShare(shareID: string) {
		const shareSongs = await this.songService.getByShare(shareID);

		return this.fromSongArray(shareSongs);
	}

	public async getArtistsForShares(shareIDs: string[]) {
		const shareSongs = await Promise.all(shareIDs.map(this.songService.getByShare));

		return this.fromSongArray(flatten(shareSongs));
	}

	private fromSongArray(songs: Song[]): Artist[] {
		const uniqueArtists = songs
			.reduce((artistsSet: Set<string>, song) => {
				song.artists.forEach(artistsSet.add);
				song.remixer.forEach(artistsSet.add);
				song.featurings.forEach(artistsSet.add);

				return artistsSet;
			}, new Set<string>());

		return Array.from(uniqueArtists)
			.map(Artist.fromString);
	}
}