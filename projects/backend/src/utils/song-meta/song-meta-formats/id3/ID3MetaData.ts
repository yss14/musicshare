import * as ID3Parser from "id3-parser"
import urlRegex from "url-regex"
import { defaultGenres } from "../../../../database/fixtures"
import { tryParseInt } from "../../../try-parse/try-parse-int"
import { ISongMetaDataSource, ExtractedSongMetaData } from "../ISongMetaDataSource"
import { IFile } from "../../../../models/interfaces/IFile"
import { ArtistExtractor, IArtist, ArtistType } from "./ArtistExtractor"
import { IID3Tag } from "id3-parser/lib/interface"
import moment from "moment"
import { ISongType, ISongTypeWithoutID } from "../../../../models/interfaces/SongType"
const similarity = require("similarity")

export class ID3MetaData implements ISongMetaDataSource {
	constructor(private readonly artistExtractor: ArtistExtractor) {}

	public isApplicableForFile(file: IFile) {
		return file.fileExtension.toLowerCase() === "mp3"
	}

	public async analyse(
		file: IFile,
		audioBuffer: Buffer,
		songTypes: ISongTypeWithoutID[],
	): Promise<ExtractedSongMetaData> {
		const id3Tags = await ID3Parser.parse(audioBuffer)

		const extractedMetaData: ExtractedSongMetaData = {
			artists: [],
			remixer: [],
			featurings: [],
			genres: [],
			type: "Original Mix",
		}

		const addArtist = (artist: IArtist) => {
			const artistTypeList = extractedMetaData[artist.type]

			if (artistTypeList instanceof Array) {
				artistTypeList.push(artist.name)
			}

			if (artist.suffix) {
				extractedMetaData.suffix = artist.suffix
			}
		}

		const isValidTitle = (title: string) => {
			let openBrackets = { "(": 0, "[": 0 }

			for (const char of title.split("")) {
				if (char === "(") {
					openBrackets["("]++
				} else if (char === "[") {
					openBrackets["["]++
				}
				if (char === ")") {
					openBrackets["("]--
				} else if (char === "]") {
					openBrackets["["]--
				}
			}

			return !Object.values(openBrackets).some((value) => value > 0)
		}

		const uniqueArray = (artists: string[]) => Array.from(new Set(artists))

		try {
			// parse title
			let title = ""

			if (
				id3Tags &&
				id3Tags.title !== undefined &&
				id3Tags.title.trim().length > 0 &&
				isValidTitle(id3Tags.title.trim())
			) {
				title = this.removeUrlClutter(id3Tags.title).replace(/\0/g, "")
			} else {
				const originalFilename = (id3Tags && id3Tags["original-filename"]) || file.originalFilename

				title = this.removeUrlClutter(originalFilename).replace(/\0/g, "")
			}

			title = title.replace(/\(\d+\)/g, "")

			//Try to find song type with corresponding artists in title
			if (title.indexOf("-") > -1) {
				let split = title.split("-")

				const artists: IArtist[] = this.artistExtractor.extract(split[0], "artists")
				artists.forEach(addArtist)

				title = split[1]
			}

			const songtype = this.findBestSongtypeMatch(title, songTypes)

			if (songtype) {
				const [type, matchedTypeString] = songtype

				extractedMetaData.type = type.name

				if (type.hasArtists) {
					//Extract corresponding artists
					const idxTypeBegin = title.toLowerCase().indexOf(matchedTypeString.toLowerCase())

					const idxTypeDelimiterEnd = idxTypeBegin + matchedTypeString.length
					let typeDelimiterChar = ""

					if (idxTypeDelimiterEnd < title.length) {
						typeDelimiterChar = title.charAt(idxTypeDelimiterEnd)
						typeDelimiterChar = typeDelimiterChar === ")" ? "(" : "["
					}

					let idxArtistBegin = -1

					if (typeDelimiterChar === "") {
						idxArtistBegin = this.indexOfCharLeft(title, "(", idxTypeBegin - 1)
							? this.indexOfCharLeft(title, "(", idxTypeBegin - 1)
							: this.indexOfCharLeft(title, "[", idxTypeBegin - 1) > -1
							? this.indexOfCharLeft(title, "[", idxTypeBegin - 1)
							: -1
					} else {
						idxArtistBegin = this.indexOfCharLeft(title, typeDelimiterChar, idxTypeBegin - 1)
					}

					if (idxTypeBegin !== -1 && idxArtistBegin !== -1) {
						const artistStr = title.substr(idxArtistBegin + 1, idxTypeBegin - idxArtistBegin - 1)

						title = title.substr(0, idxArtistBegin)

						const artists: IArtist[] = this.artistExtractor.extract(artistStr, "remixer")

						artists.forEach(addArtist)
					}
				}

				title = title.split(type.name).join("").replace("()", "")
			}

			// try to find featuring part
			let featuringIdx = -1

			for (const featuringSeparator of ArtistExtractor.featuringSeparators) {
				featuringIdx = title.indexOf(featuringSeparator)

				if (featuringIdx > -1) {
					break
				}
			}

			if (featuringIdx > -1) {
				const artistStr = title.substr(featuringIdx, title.length - featuringIdx)

				const artists: IArtist[] = this.artistExtractor.extract(artistStr, "featurings")

				artists.forEach(addArtist)

				title = title.substr(0, featuringIdx - 1)
			}

			extractedMetaData.title = title.trim()

			if (id3Tags) {
				//Parse artists
				this.getArtists(id3Tags).forEach(addArtist)

				//Parse year
				if (id3Tags.year !== undefined) {
					const parsedYear = tryParseInt(id3Tags.year, -1)

					if (parsedYear > 1800) {
						extractedMetaData.year = parsedYear
					}
				}

				//Genre
				const genreNames = defaultGenres.map((defaultGenre) => defaultGenre.name)

				if (id3Tags.genre !== undefined) {
					if (genreNames.indexOf(id3Tags.genre) > -1) {
						extractedMetaData.genres!.push(id3Tags.genre)
					} else {
						//Similarity test
						let bestScore = 0
						let _genre = ""

						genreNames.forEach((genre) => {
							const sim = similarity(id3Tags.genre, genre)
							if (sim > bestScore) {
								bestScore = sim
								_genre = genre
							}
						})

						if (bestScore >= 0.6) {
							extractedMetaData.genres!.push(_genre)
						}
					}
				}

				//BPM
				if (id3Tags.bpm) {
					const parsedBPM = tryParseInt(id3Tags.bpm, -1)
					extractedMetaData.bpm = parsedBPM > 0 ? parsedBPM : null
				}

				//Release date
				if (id3Tags["release-time"] || id3Tags["original-release-time"]) {
					const releaseTime = id3Tags["release-time"] || id3Tags["original-release-time"]
					const parsedReleaseDate = moment(new Date(releaseTime!)).format("YYYY-MM-DD")

					if (parsedReleaseDate !== "Invalid date") {
						extractedMetaData.releaseDate = parsedReleaseDate
					}
				}

				//Label
				if (id3Tags.publisher !== undefined) {
					const cleanedLabel = this.removeUrlClutter(id3Tags.publisher)

					if (cleanedLabel.length > 0) {
						extractedMetaData.labels = [cleanedLabel]
					}
				}
			}
		} catch (err) {
			/* istanbul ignore next */
			console.error(err)
		}

		extractedMetaData.artists = uniqueArray(extractedMetaData.artists!)
		extractedMetaData.remixer = uniqueArray(extractedMetaData.remixer!)
		extractedMetaData.featurings = uniqueArray(extractedMetaData.featurings!)
		extractedMetaData.genres = uniqueArray(extractedMetaData.genres!)

		return extractedMetaData
	}

	private findBestSongtypeMatch(title: string, songTypes: ISongTypeWithoutID[]): [ISongTypeWithoutID, string] | null {
		interface IMatch {
			matchingString: string
			type: ISongTypeWithoutID
		}

		const titleIncludesSongtype = (type: ISongTypeWithoutID): [boolean, string] => {
			if (title.toLowerCase().indexOf(type.name.toLowerCase()) > -1) {
				return [true, type.name]
			}

			return [false, type.name]
		}

		const matches: IMatch[] = []

		for (const type of songTypes) {
			const [typeIsInTitle, matchingString] = titleIncludesSongtype(type)

			if (typeIsInTitle) {
				matches.push({ matchingString, type })
			}

			if (type.alternativeNames !== undefined) {
				for (const alternativeName of type.alternativeNames) {
					if (title.toLowerCase().indexOf(alternativeName.toLowerCase()) > -1) {
						matches.push({ matchingString: alternativeName, type })
					}
				}
			}
		}

		let songtypeMatch: IMatch | null = null

		for (const match of matches) {
			if (songtypeMatch === null || match.matchingString.length > songtypeMatch.matchingString.length) {
				songtypeMatch = match
			}
		}

		return songtypeMatch ? [songtypeMatch.type, songtypeMatch.matchingString] : null
	}

	private getArtists(id3Tags: IID3Tag): IArtist[] {
		const artistNames = new Set<string>()

		if (id3Tags.artist !== undefined) {
			this.artistExtractor.extract(id3Tags.artist, "artists").forEach((artist) => artistNames.add(artist.name))
		}

		const userDefinedTextInfo = id3Tags["user-defined-text-information"]

		if (userDefinedTextInfo instanceof Array) {
			for (const textInformation of userDefinedTextInfo) {
				if (textInformation.description && textInformation.description.toLowerCase() === "artists") {
					if (textInformation.value) {
						this.artistExtractor
							.extract(textInformation.value, "artists")
							.forEach((artist) => artistNames.add(artist.name))
					}
				}
			}
		}

		const artistType: ArtistType = "artists"

		return Array.from(artistNames).map((artistName) => ({ name: artistName, type: artistType }))
	}

	private removeUrlClutter(input: string): string {
		const urls = input.match(urlRegex({ strict: false }))
		let output = input

		if (urls) {
			urls.forEach((url) => {
				output = output.split(url).join("")
			})
		}

		return output.replace("()", "").replace("[]", "")
	}

	private indexOfCharLeft(str: string, needle: string, fromIdx: number) {
		for (let i = fromIdx; i >= 0; i--) {
			if (str.charAt(i) === needle) {
				return i
			}
		}

		/* istanbul ignore next */
		return -1
	}
}
