import { ShareSong, PlaylistSong } from "../../models/SongModel";

export const compareSongs = <S extends ShareSong | PlaylistSong>(lhs: S, rhs: S) => {
	const { artists: lArtists, remixer: lRemixer, featurings: lFeaturings, genres: lGenres, ...lRest } = lhs;
	const { artists: rArtists, remixer: rRemixer, featurings: rFeaturings, genres: rGenres, ...rRest } = rhs;

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
}

export const includesSong = <S extends ShareSong | PlaylistSong>(songs: S[], song: S) => {
	const expectedSong = songs.find(s => s.id === song.id);

	if (!expectedSong) {
		throw `Song with id ${song.id} not in list`;
	}

	compareSongs(expectedSong, song);
}

type SongRest<S extends ShareSong | PlaylistSong> = Pick<S, Exclude<keyof S, "artists" | "remixer" | "featurings" | "genres">>

const isPlaylistSongRest = (obj: any): obj is SongRest<PlaylistSong> => obj.dateAdded !== undefined;