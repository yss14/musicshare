import { Artist } from "../models/ArtistModel";
import { ISongService } from "./SongService";
import { Song } from "../models/SongModel";
import { flatten } from "lodash";
import { IShareService } from "./ShareService";

export interface IArtistService {
	getArtistsForShare(shareID: string): Promise<Artist[]>;
	getArtistsForShares(shareIDs: string[]): Promise<Artist[]>;
	getAggregatedArtistsForUser(userID: string): Promise<Artist[]>;
}

export class ArtistService implements IArtistService {
	constructor(
		private readonly songService: ISongService,
		private readonly shareService: IShareService,
	) { }

	public async getArtistsForShare(shareID: string) {
		const shareSongs = await this.songService.getByShare(shareID);

		return this.fromSongArray(shareSongs);
	}

	public async getArtistsForShares(shareIDs: string[]) {
		const shareSongs = await Promise.all(shareIDs.map((shareID) => this.songService.getByShare(shareID)));

		return this.fromSongArray(flatten(shareSongs));
	}

	public async getAggregatedArtistsForUser(userID: string): Promise<Artist[]> {
		const linkedLibraries = await this.shareService.getLinkedLibrariesOfUser(userID)

		const aggregatedSongs = flatten(
			await Promise.all(linkedLibraries.map(linkedLibrary => this.songService.getByShare(linkedLibrary.id)))
		)

		return this.fromSongArray(aggregatedSongs)
	}

	private fromSongArray(songs: Song[]): Artist[] {
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