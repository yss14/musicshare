import { Artist } from "../models/ArtistModel";
import { ISongService } from "./SongService";
import { ShareSong } from "../models/SongModel";
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
		const shareSongs = await Promise.all(shareIDs.map((shareID) => this.songService.getByShare(shareID)));

		return this.fromSongArray(flatten(shareSongs));
	}

	private fromSongArray(songs: ShareSong[]): Artist[] {
		const uniqueArtists = songs
			.reduce((artistsSet: Set<string>, song) => {
				song.artists.forEach(artist => artistsSet.add(artist));
				song.remixer.forEach(remixer => artistsSet.add(remixer));
				song.featurings.forEach(featuring => artistsSet.add(featuring));

				return artistsSet;
			}, new Set<string>());

		return Array.from(uniqueArtists)
			.map(Artist.fromString);
	}
}