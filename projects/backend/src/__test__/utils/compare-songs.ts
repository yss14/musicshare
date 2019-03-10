import { Song } from "../../models/SongModel";

export const compareSongs = (lhs: Song, rhs: Song) => {
	const { artists: lArtists, remixer: lRemixer, featurings: lFeaturings, genres: lGenres, ...lRest } = lhs;
	const { artists: rArtists, remixer: rRemixer, featurings: rFeaturings, genres: rGenres, ...rRest } = rhs;

	// need to be sorted, otherwise order is compared by jest
	expect(lArtists.sort()).toEqual(rArtists.sort());
	expect(lRemixer.sort()).toEqual(rRemixer.sort());
	expect(lFeaturings.sort()).toEqual(rFeaturings.sort());
	expect(lGenres.sort()).toEqual(rGenres);

	expect(lRest).toEqual(rRest);
}

export const includesSong = (songs: Song[], song: Song) => {
	const expectedSong = songs.find(s => s.id === song.id);

	if (!expectedSong) {
		throw `Song with id ${song.id} not in list`;
	}

	compareSongs(expectedSong, song);
}