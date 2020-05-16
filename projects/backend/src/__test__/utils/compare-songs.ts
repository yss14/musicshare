import { ShareSong } from "../../models/SongModel"

export const compareSongs = <S extends ShareSong>(lhs: S, rhs: S) => {
	const {
		artists: lArtists,
		remixer: lRemixer,
		featurings: lFeaturings,
		genres: lGenres,
		releaseDate: lReleaseDate, // eslint-disable-line @typescript-eslint/no-unused-vars
		shareID: lShareID, // eslint-disable-line @typescript-eslint/no-unused-vars
		numberOfSources: lNumberOfSources, // eslint-disable-line @typescript-eslint/no-unused-vars
		sources: lSources,
		...lRest
	} = lhs
	const {
		artists: rArtists,
		remixer: rRemixer,
		featurings: rFeaturings,
		genres: rGenres,
		releaseDate: rReleaseDate, // eslint-disable-line @typescript-eslint/no-unused-vars
		shareID: rShareID, // eslint-disable-line @typescript-eslint/no-unused-vars
		numberOfSources: rNumberOfSources, // eslint-disable-line @typescript-eslint/no-unused-vars
		sources: rSources,
		...rRest
	} = rhs

	// need to be sorted, otherwise order is compared by jest
	expect(lArtists.sort()).toEqual(rArtists.sort())
	expect(lRemixer.sort()).toEqual(rRemixer.sort())
	expect(lFeaturings.sort()).toEqual(rFeaturings.sort())
	expect(lGenres.sort()).toEqual(rGenres)

	if (isPlaylistSongRest(lRest) && isPlaylistSongRest(rRest)) {
		const { dateAdded: dateAddedL, ...lRestWithoutDate } = lRest // eslint-disable-line @typescript-eslint/no-unused-vars
		const { dateAdded: dateAddedR, ...rRestWithoutDate } = rRest // eslint-disable-line @typescript-eslint/no-unused-vars

		expect(lRestWithoutDate).toEqual(rRestWithoutDate)
	} else {
		expect(lRest).toEqual(rRest)
	}

	if (lSources && rSources) {
		expect(lSources).toMatchObject(rSources)
	}
}

export const includesSong = <S extends ShareSong>(songs: S[], song: S) => {
	const expectedSong = songs.find((s) => s.id === song.id)

	if (!expectedSong) {
		throw `Song with id ${song.id} not in list`
	}

	compareSongs(expectedSong, song)
}

type SongRest<S extends ShareSong> = Pick<S, Exclude<keyof S, "artists" | "remixer" | "featurings" | "genres">>

const isPlaylistSongRest = (obj: any): obj is SongRest<ShareSong> => obj.dateAdded !== undefined
