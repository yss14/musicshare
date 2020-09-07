import { IID3Tag } from "id3-parser/lib/interface"
import { Nullable } from "../../types/Nullable"
import { BaseSong } from "@musicshare/shared-types"

interface IID3SampleTest {
	originalFilename: string
	sample: IID3Tag | false
	expectedOutput: Partial<Nullable<BaseSong>>
	knownArtists?: string[]
}

const defaultExpectedOutput = {
	artists: [],
	remixer: [],
	featurings: [],
	genres: [],
	type: "Original Mix",
}

export const id3Samples: IID3SampleTest[] = [
	{
		originalFilename: "Running Away (Original Mix)",
		sample: {
			version: {
				v1: { major: 1, minor: 1 },
				v2: true,
			},
			title: "",
			artist: "",
			album: "",
			year: "",
			comments: "",
			track: "/02",
			genre: "",
			bpm: "128",
			band: "Farius",
			"set-part": "1/1",
			publisher: "Zerothree",
			isrc: "GBJAJ1802208",
			length: "365",
			"user-defined-text-information": [
				{ description: "Artists", value: "Farius" },
				{ description: "RELEASETYPE", value: "Single" },
				{ description: "BARCODE", value: "5052075701561" },
				{ description: "LABEL", value: "Zerothree" },
				{ description: "EXPLICIT", value: "0" },
				{ description: "SOURCEID", value: "608253192" },
			],
			"initial-key": "G min",
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "Running Away",
			type: "Original Mix",
			artists: ["Farius"],
			bpm: 128,
			labels: ["Zerothree"],
		},
	},
	{
		originalFilename: "",
		sample: {
			version: {
				v1: false,
				v2: true,
			},
			title: "Got This Feeling (Original Mix)",
			artist: "Cubicolor",
			album: "",
			comments: [{ language: "\u0000\u0000\u0000", description: "", value: "" }],
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "Got This Feeling",
			artists: ["Cubicolor"],
			type: "Original Mix",
		},
	},
	{
		originalFilename: "",
		sample: {
			version: {
				v1: { major: 1, minor: 1 },
				v2: true,
			},
			title: "Contact (Original Mix) [someurl.com]",
			artist: "Rue, Alastor",
			album: "someurl.com",
			year: "2018",
			comments: [{ value: "someurl.com" }, { language: "eng", description: "", value: "someurl.com" }],
			track: 0,
			genre: "",
			band: "someurl.com",
			composer: "someurl.com",
			"original-artist": "someurl.com",
			copyright: "someurl.com",
			encoder: "someurl.com",
			publisher: "someurl.com",
			"content-group": "someurl.com",
			bpm: "someurl.com",
			writer: "someurl.com",
			remixer: "someurl.com",
			conductor: "someurl.com",
			subtitle: "someurl.com",
			isrc: "someurl.com",
			"initial-key": "someurl.com",
			lyrics: [{ language: "xxx", description: "", value: "someurl.com" }],
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "Contact",
			artists: ["Rue", "Alastor"],
			type: "Original Mix",
			year: 2018,
			bpm: null,
		},
	},
	{
		originalFilename: "Armin van Buuren, Sam Martin - Wild Wild Son (Richard Durand Extended Remix) [SWM]",
		sample: {
			version: {
				v1: { major: 1, minor: 1 },
				v2: true,
			},
			title: "",
			artist: "",
			album: "",
			year: "2019",
			comments: "",
			track: 0,
			genre: "Trance",
			language: "English",
			remixer: "Richard Durand",
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "Wild Wild Son",
			artists: ["Armin van Buuren", "Sam Martin"],
			remixer: ["Richard Durand"],
			type: "Remix",
			year: 2019,
			genres: ["Trance"],
		},
	},
	{
		originalFilename:
			"Dimitri Vegas & Like Mike Vs. Vini Vici & Cherrymoon Trax - The House Of House (Extended Mix)",
		sample: {
			version: {
				v1: { major: 1, minor: 1 },
				v2: true,
			},
			title: "The House Of House (Extended Mix)",
			artist: "Dimitri Vegas & Like Mike Vs. Vini Vici & Cherrymoon Trax",
			album: "The House Of House",
			year: "2018",
			comments: "",
			track: 0,
			genre: "Psytrance",
			band: "Dimitri Vegas & Like Mike Vs. Vini Vici & Cherrymoon Trax",
			composer: "Dimitri Vegas & Like Mike Vs. Vini Vici & Cherrymoon Trax",
			"original-artist": "Cherrymoon Trax",
			remixer: "Dimitri Vegas & Like Mike Vs. Vini Vici",
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "The House Of House",
			artists: ["Dimitri Vegas & Like Mike", "Vini Vici", "Cherrymoon Trax"],
			type: "Extended Mix",
			year: 2018,
			genres: ["Psy Trance"],
		},
		knownArtists: ["Dimitri Vegas & Like Mike"],
	},
	{
		originalFilename: "Dash Berlin - Man On The Run (WHITENO1SE & System Nipel remix)",
		sample: {
			version: {
				v1: { major: 1, minor: 0 },
				v2: false,
			},
			title: "Man On The Run (WHITENO1SE &",
			artist: "Dash Berlin",
			album: "",
			year: "19",
			comments: "",
			genre: "Psychedelic",
			"release-time": "2017-06-21",
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "Man On The Run",
			artists: ["Dash Berlin"],
			remixer: ["WHITENO1SE", "System Nipel"],
			type: "Remix",
			releaseDate: "2017-06-21",
		},
	},
	{
		originalFilename: "abcd",
		sample: {
			version: {
				v1: { major: 1, minor: 0 },
				v2: false,
			},
			"original-filename": "Dash Berlin - Man On The Run (WHITENO1SE & System Nipel remix)",
			"original-release-time": "2017-06-21",
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "Man On The Run",
			artists: ["Dash Berlin"],
			remixer: ["WHITENO1SE", "System Nipel"],
			type: "Remix",
			releaseDate: "2017-06-21",
		},
	},
	{
		originalFilename: "abcd",
		sample: {
			version: {
				v1: { major: 1, minor: 0 },
				v2: false,
			},
			title: "We Won't Be Alone (feat. Laura Brehm)",
			artist: "Feint",
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "We Won't Be Alone",
			artists: ["Feint"],
			featurings: ["Laura Brehm"],
			type: "Original Mix",
		},
	},
	{
		originalFilename: "Above & Beyond - Bittersweet & Blue (Above & Beyond Extended Club Mix)",
		sample: {
			version: {
				v1: { major: 1, minor: 1 },
				v2: false,
			},
			title: "Bittersweet & Blue (Above & Beyond Extended Club Mix)",
			artist: "Above & Beyond; Richard Bedford",
			album: "Bittersweet & Blue",
			year: "2020",
			comments: "",
			track: "2",
			genre: "Dance; Trance",
			band: "Above & Beyond",
			"set-part": "1",
			isrc: "GBEWA1905411",
			publisher: "Anjunabeats",
		},
		expectedOutput: {
			...defaultExpectedOutput,
			title: "Bittersweet & Blue",
			artists: ["Above", "Beyond", "Richard Bedford"],
			remixer: ["Above", "Beyond"],
			type: "Club Mix",
			labels: ["Anjunabeats"],
			year: 2020,
		},
	},
]
