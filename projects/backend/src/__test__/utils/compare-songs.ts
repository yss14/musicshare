import { Song } from "../../models/SongModel";

export const compareSongs = <S extends Song>(lhs: S, rhs: S) => {
	const { artists: lArtists, remixer: lRemixer, featurings: lFeaturings, genres: lGenres, releaseDate: lReleaseDate, sources: lSources, ...lRest } = lhs;
	const { artists: rArtists, remixer: rRemixer, featurings: rFeaturings, genres: rGenres, releaseDate: rReleaseDate, sources: rSources, ...rRest } = rhs;

	// need to be sorted, otherwise order is compared by jest
	expect(lArtists.sort()).toEqual(rArtists.sort());
	expect(lRemixer.sort()).toEqual(rRemixer.sort());
	expect(lFeaturings.sort()).toEqual(rFeaturings.sort());
	expect(lGenres.sort()).toEqual(rGenres);

	if (isPlaylistSongRest(lRest) && isPlaylistSongRest(rRest)) {
		const { dateAdded: dateAddedL, ...lRestWithoutDate } = lRest;
		const { dateAdded: dateAddedR, ...rRestWithoutDate } = rRest;

		expect(lRestWithoutDate).toEqual(rRestWithoutDate);
	} else {
		expect(lRest).toEqual(rRest);
	}

	if (lSources && rSources) {
		expect(lSources).toMatchObject(rSources)
	}
}

export const includesSong = <S extends Song | Song>(songs: S[], song: S) => {
	const expectedSong = songs.find(s => s.id === song.id);

	if (!expectedSong) {
		throw `Song with id ${song.id} not in list`;
	}

	compareSongs(expectedSong, song);
}

type SongRest<S extends Song | Song> = Pick<S, Exclude<keyof S, "artists" | "remixer" | "featurings" | "genres">>

const isPlaylistSongRest = (obj: any): obj is SongRest<Song> => obj.dateAdded !== undefined;