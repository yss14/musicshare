import * as ID3Parser from "id3-parser"
import { ID3MetaData } from "../utils/song-meta/song-meta-formats/id3/ID3MetaData"
import { ArtistExtractor } from "../utils/song-meta/song-meta-formats/id3/ArtistExtractor"
import { IFile } from "../models/interfaces/IFile"
import { ISong } from "../models/interfaces/ISong"
import { Nullable } from "../types/Nullable"
import { id3Samples } from "./assets/id3-samples"
import { defaultSongTypes } from "../database/fixtures"

jest.mock("id3-parser")

const makeTestFile = (originalFilename: string): IFile => ({
	fileExtension: "mp3",
	blob: "someblob",
	container: "songs",
	originalFilename,
})

describe("isApplicableForFile()", () => {
	test("applicable", () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))

		expect(id3MetaData.isApplicableForFile(makeTestFile("some name"))).toBe(true)
	})

	test("applicable", () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))
		const file = makeTestFile("some name")
		file.fileExtension = "wav"

		expect(id3MetaData.isApplicableForFile(file)).toBe(false)
	})
})

describe("filename is main source", () => {
	;(ID3Parser.parse as any).mockResolvedValue({})

	test("two artists, extended mix", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor(["Vintage & Morelli"]))

		const filename = "Ilan Bluestone, Giuseppe de Luca - I Believe (Vintage & Morelli Extended Mix)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["Ilan Bluestone", "Giuseppe de Luca"],
			title: "I Believe",
			remixer: ["Vintage & Morelli"],
			type: "Extended Mix",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("suffixed mix", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor(["Myon & Shane 54"]))

		const filename = "02 Keep Your Secrets (Myon & Shane 54 Summer Of Love Mix)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: [],
			title: "02 Keep Your Secrets",
			remixer: ["Myon & Shane 54"],
			type: "Remix",
			suffix: "Summer Of Love",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("suffixed remix with apostrophed known artist", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor(["EDX"]))

		const filename = "The Avener, Adam Cohen - We Go Home (EDX's Paris at Night Remix)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["The Avener", "Adam Cohen"],
			title: "We Go Home",
			remixer: ["EDX"],
			type: "Remix",
			suffix: "'s Paris at Night",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("suffixed remix with apostrophed without known artist", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))

		const filename = "The Avener, Adam Cohen - We Go Home (EDX's Paris at Night Remix)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["The Avener", "Adam Cohen"],
			title: "We Go Home",
			remixer: ["EDX"],
			type: "Remix",
			suffix: "'s Paris at Night",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("prefixed artists separated by a dash", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor(["Lilly Wood & The Prick"]))

		const filename = "Lilly Wood & The Prick and Robin Schulz - Prayer In C (Stefan Dabruck Remix)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["Lilly Wood & The Prick", "Robin Schulz"],
			title: "Prayer In C",
			remixer: ["Stefan Dabruck"],
			type: "Remix",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("alternative song title with prefixed artist", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))

		const filename = "Galantis - Runaway (U&I) (Kaskade Remix)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["Galantis"],
			title: "Runaway (U&I)",
			remixer: ["Kaskade"],
			type: "Remix",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("filename with url", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))

		const filename = "Sander Van Doorn & MOTi - Lost (Extended Mix) (someurl.Net)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["Sander Van Doorn", "MOTi"],
			title: "Lost",
			type: "Extended Mix",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("broken featuring part", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))

		const filename = "Sultan + Shepard - Chasing (In The Night) (feat."
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["Sultan + Shepard"],
			title: "Chasing (In The Night)",
			featurings: [],
			type: "Original Mix",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("song type wrapped in [] brackets", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))

		const filename = "Sander Van Doorn & MOTi - Lost [Extended Mix]"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: ["Sander Van Doorn", "MOTi"],
			title: "Lost",
			type: "Extended Mix",
		}

		expect(result).toMatchObject(expectedResult)
	})

	test("featuring without song type and artist", async () => {
		const id3MetaData = new ID3MetaData(new ArtistExtractor([]))

		const filename = "We Won't Be Alone (feat. Laura Brehm)"
		const result = await id3MetaData.analyse(makeTestFile(filename), Buffer.from(""), defaultSongTypes)

		const expectedResult: Partial<Nullable<ISong>> = {
			artists: [],
			featurings: ["Laura Brehm"],
			title: "We Won't Be Alone",
			type: "Original Mix",
		}

		expect(result).toMatchObject(expectedResult)
	})
})

describe("id3 meta data from real files", () => {
	id3Samples.forEach((testData, idx) => {
		test(`test ${idx + 1}`, async () => {
			;(ID3Parser.parse as any).mockResolvedValue(testData.sample)

			const id3MetaData = new ID3MetaData(new ArtistExtractor(testData.knownArtists || []))

			const result = await id3MetaData.analyse(
				makeTestFile(testData.originalFilename),
				Buffer.from(""),
				defaultSongTypes,
			)

			expect(result).toEqual(testData.expectedOutput)
		})
	})
})
