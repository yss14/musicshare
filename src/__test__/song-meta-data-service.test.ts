import { ISongMetaDataSource, ExtractedSongMetaData } from "../utils/song-meta/song-meta-formats/ISongMetaDataSource";
import { SongMetaDataService } from "../utils/song-meta/SongMetaDataService";

test('merge two meta data source', async () => {
	const firstSource: ISongMetaDataSource = {
		isApplicableForFile: () => true,
		analyse: async () => ({ title: 'Some title', artists: ['Artist A', 'Artist B'], label: 'Some label' })
	}

	const secondSource: ISongMetaDataSource = {
		isApplicableForFile: () => true,
		analyse: async () => ({ title: 'Some other title', bpm: 128, artists: ['Artist C'], genres: ['House'], label: null })
	}

	const songMetaDataService = new SongMetaDataService([firstSource, secondSource]);

	const extractedMetaData = await songMetaDataService.analyse(null as any, Buffer.from(''));

	expect(extractedMetaData).toEqual({
		title: 'Some other title',
		bpm: 128,
		artists: ['Artist A', 'Artist B', 'Artist C'],
		genres: ['House'],
		label: 'Some label'
	} as ExtractedSongMetaData);
});