import { ISongMetaDataSource, ExtractedSongMetaData } from "../utils/song-meta/song-meta-formats/ISongMetaDataSource"
import { SongMetaDataService } from "../utils/song-meta/SongMetaDataService"
import { defaultSongTypes } from "../database/fixtures"

test("merge two meta data source", async () => {
	const firstSource: ISongMetaDataSource = {
		isApplicableForFile: () => true,
		analyse: async () => ({ title: "Some title", artists: ["Artist A", "Artist B"], labels: ["Some label"] }),
	}

	const secondSource: ISongMetaDataSource = {
		isApplicableForFile: () => true,
		analyse: async () => ({
			title: "Some other title",
			bpm: 128,
			artists: ["Artist C"],
			genres: ["House"],
			labels: [],
		}),
	}

	const songMetaDataService = new SongMetaDataService([firstSource, secondSource])

	const extractedMetaData = await songMetaDataService.analyse(null as any, Buffer.from(""), defaultSongTypes)

	expect(extractedMetaData).toEqual({
		title: "Some other title",
		bpm: 128,
		artists: ["Artist A", "Artist B", "Artist C"],
		genres: ["House"],
		labels: ["Some label"],
	} as ExtractedSongMetaData)
})
