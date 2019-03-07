import { ArtistExtractor } from "../utils/song-meta/song-meta-formats/id3/ArtistExtractor";

describe('without known artists', () => {
	const artistExtractor = new ArtistExtractor();

	test('vs.', () => {
		const baseString = 'Above & Beyond vs. Armin van Buuren vs. Some Random Dude';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above', type: 'artists' },
			{ name: 'Beyond', type: 'artists' },
			{ name: 'Armin van Buuren', type: 'artists' },
			{ name: 'Some Random Dude', type: 'artists' }
		]);
	});

	test('vs', () => {
		const baseString = 'Above & Beyond vs Armin van Buuren';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above', type: 'artists' },
			{ name: 'Beyond', type: 'artists' },
			{ name: 'Armin van Buuren', type: 'artists' }
		]);
	});

	test('&', () => {
		const baseString = 'Vini Vici & Timmy Trumpet ';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Vini Vici', type: 'artists' },
			{ name: 'Timmy Trumpet', type: 'artists' }
		]);
	});

	test(', with space', () => {
		const baseString = 'Ane Brun, Andrew Bayer';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Ane Brun', type: 'artists' },
			{ name: 'Andrew Bayer', type: 'artists' }
		]);
	});

	test(', without space', () => {
		const baseString = 'Ane Brun,Andrew Bayer';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Ane Brun', type: 'artists' },
			{ name: 'Andrew Bayer', type: 'artists' }
		]);
	});

	test('and', () => {
		const baseString = 'Ane Brun and Andrew Bayer';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Ane Brun', type: 'artists' },
			{ name: 'Andrew Bayer', type: 'artists' }
		]);
	});

	test(' x ', () => {
		const baseString = 'Ane Brun x Andrew Bayer x Grum';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Ane Brun', type: 'artists' },
			{ name: 'Andrew Bayer', type: 'artists' },
			{ name: 'Grum', type: 'artists' }
		]);
	});

	test('feat.', () => {
		const baseString = 'Above & Beyond feat. Alex Vargas';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above', type: 'artists' },
			{ name: 'Beyond', type: 'artists' },
			{ name: 'Alex Vargas', type: 'featurings' }
		]);
	});

	test('ft.', () => {
		const baseString = 'Above & Beyond ft. Alex Vargas';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above', type: 'artists' },
			{ name: 'Beyond', type: 'artists' },
			{ name: 'Alex Vargas', type: 'featurings' }
		]);
	});

	test('feat ', () => {
		const baseString = 'Above & Beyond feat Alex Vargas';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above', type: 'artists' },
			{ name: 'Beyond', type: 'artists' },
			{ name: 'Alex Vargas', type: 'featurings' }
		]);
	});
});

describe('with known artists', () => {
	test('vs.', () => {
		const artistExtractor = new ArtistExtractor(new Set(['Above & Beyond']));
		const baseString = 'Above & Beyond vs. Armin van Buuren vs. Some Random Dude';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Armin van Buuren', type: 'artists' },
			{ name: 'Some Random Dude', type: 'artists' }
		]);
	});

	test('vs', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Above & Beyond vs Armin van Buuren';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Armin van Buuren', type: 'artists' }
		]);
	});

	test('&', () => {
		const artistExtractor = new ArtistExtractor(['Timmy & Trumpet']);
		const baseString = 'Vini Vici & Timmy & Trumpet ';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Timmy & Trumpet', type: 'artists' },
			{ name: 'Vini Vici', type: 'artists' }
		]);
	});

	test('& with known artist in the middle', () => {
		const artistExtractor = new ArtistExtractor(['DudeB & DudeC']);
		const baseString = 'DudeA & DudeB & DudeC & DudeD';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'DudeB & DudeC', type: 'artists' },
			{ name: 'DudeA', type: 'artists' },
			{ name: 'DudeD', type: 'artists' }
		]);
	});

	test(', with space', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Above & Beyond, Andrew Bayer';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Andrew Bayer', type: 'artists' }
		]);
	});

	test(', without space', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Ane Brun,Above & Beyond';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Ane Brun', type: 'artists' }
		]);
	});

	test(' x ', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Ane Brun and Above & Beyond';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Ane Brun', type: 'artists' }
		]);
	});

	test(' x ', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond', 'Gabriel & Dresden']);
		const baseString = 'Gabriel & Dresden x Ane Brun x Above & Beyond';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Gabriel & Dresden', type: 'artists' },
			{ name: 'Ane Brun', type: 'artists' }
		]);
	});

	test('feat.', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Above & Beyond feat. Alex Vargas';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Alex Vargas', type: 'featurings' }
		]);
	});

	test('ft.', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Above & Beyond ft. Alex Vargas';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Alex Vargas', type: 'featurings' }
		]);
	});

	test('feat ', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Above & Beyond feat Alex Vargas';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Above & Beyond', type: 'artists' },
			{ name: 'Alex Vargas', type: 'featurings' }
		]);
	});

	test('known artist in feat substr', () => {
		const artistExtractor = new ArtistExtractor(['Above & Beyond']);
		const baseString = 'Alex Vargas feat. Above & Beyond';

		expect(artistExtractor.extract(baseString, 'artists')).toEqual([
			{ name: 'Alex Vargas', type: 'artists' },
			{ name: 'Above & Beyond', type: 'featurings' }
		]);
	});
});