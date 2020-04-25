import { MP3SongDuration } from "../utils/song-meta/song-meta-formats/id3/MP3SongDuration"
import { IFile } from "../models/interfaces/IFile"
import { promises as fsPromises } from "fs"
import * as path from "path"

const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")
let mp3FileBuffer: Buffer
const mp3FileDuration = new MP3SongDuration()

const validFile: IFile = {
	blob: "",
	container: "",
	fileExtension: "mp3",
	originalFilename: "somefile.mp3",
}

beforeAll(async () => {
	mp3FileBuffer = await fsPromises.readFile(mp3FilePath)
})

test("is applicable", () => {
	expect(mp3FileDuration.isApplicableForFile(validFile)).toBe(true)
	expect(mp3FileDuration.isApplicableForFile({ ...validFile, fileExtension: "doc" })).toBe(false)
})

test("valid file buffer", async () => {
	const songMeta = await mp3FileDuration.analyse(validFile, mp3FileBuffer, [])

	expect(songMeta.duration).toBeGreaterThan(0)
})

test("invalid file buffer", async () => {
	const songMeta = await mp3FileDuration.analyse(validFile, Buffer.from(""), [])

	expect(songMeta).toEqual({})
})
