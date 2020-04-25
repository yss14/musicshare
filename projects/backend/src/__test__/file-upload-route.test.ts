import * as path from "path"
import { FileServiceMock } from "./mocks/FileServiceMock"
import { promises as fsPromises } from "fs"
import { fileUploadRouter, fileUploadErrors, extractPlaylistIDs } from "../server/routes/file-upload-route"
import { makeExpressApp } from "./utils/make-express-app"
import request from "supertest"
import { HTTPStatusCodes } from "../types/http-status-codes"
import { commonRestErrors } from "../utils/typed-express/common-rest-errors"
import { SongUploadProcessingQueueMock } from "./mocks/SongUploadProcessingQueueMock"
import { v4 as uuid } from "uuid"
import { NextHandleFunction } from "connect"
import { CustomRequestHandler } from "../types/context"

const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")
let mp3FileBuffer: Buffer
const acceptedContentTypes = ["audio/mpeg"]

const passingFileService = new FileServiceMock(
	() => undefined,
	() => "",
)
const songUploadProcessingQueue = new SongUploadProcessingQueueMock()
const mockedAuth: CustomRequestHandler = (req, res, next) => next()
const defaultRestRouter = fileUploadRouter({
	songFileService: passingFileService,
	uploadProcessingQueue: songUploadProcessingQueue,
	maxFileSize: 10 * 1024 * 1024,
	allowedMimeTypes: acceptedContentTypes,
	auth: mockedAuth,
})
const defaultExpressApp = makeExpressApp({ routers: [defaultRestRouter] })

beforeAll(async () => {
	mp3FileBuffer = await fsPromises.readFile(mp3FilePath)
})

test("valid request", async (done) => {
	const httpRequest = request(defaultExpressApp)
		.post(`/users/${uuid()}/shares/${uuid()}/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")

	httpRequest.write(mp3FileBuffer)
	httpRequest.end((err, res) => {
		if (err) throw err

		expect(res.status).toBe(HTTPStatusCodes.CREATED)

		done()
	})
})

test("invalid request passing a json", async (done) => {
	const httpRequest = request(defaultExpressApp)
		.post(`/users/${uuid()}/shares/${uuid()}/files/SampleAudio.mp3`)
		.set("Content-Type", "application/json")

	httpRequest.send(JSON.stringify({ someProp: 42 }))
	httpRequest.end((err, res) => {
		if (err) throw err

		expect(res.status).toBe(HTTPStatusCodes.BAD_REQUEST)
		expect(res.body.error).toEqual(fileUploadErrors.bodyNoValidByteBuffer)

		done()
	})
})

test("invalid request passing too large file", async (done) => {
	let tooLargeFileBuffer = mp3FileBuffer

	while (tooLargeFileBuffer.length < 11 * 1024 * 1024) {
		tooLargeFileBuffer = Buffer.concat([tooLargeFileBuffer, tooLargeFileBuffer])
	}

	const httpRequest = request(defaultExpressApp)
		.post(`/users/${uuid()}/shares/${uuid()}/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")

	httpRequest.write(tooLargeFileBuffer)
	httpRequest.end((err, res) => {
		if (err) throw err

		expect(res.status).toBe(HTTPStatusCodes.REQUEST_ENTITY_TOO_LARGE)

		done()
	})
})

test("invalid request passing invalid userID", async () => {
	const response1 = await request(defaultExpressApp)
		.post(`/users/true/shares/${uuid()}/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")
		.send()

	const response2 = await request(defaultExpressApp)
		.post(`/users/42.2/shares/${uuid()}/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")
		.send()

	const response3 = await request(defaultExpressApp)
		.post(`/users/abcd-efgh/shares/${uuid()}/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")
		.send()

	expect(response1.status).toBe(HTTPStatusCodes.BAD_REQUEST)
	expect(response2.status).toBe(HTTPStatusCodes.BAD_REQUEST)
	expect(response3.status).toBe(HTTPStatusCodes.BAD_REQUEST)

	expect(response1.body.error).toEqual(fileUploadErrors.paramUserIDNotValid)
	expect(response2.body.error).toEqual(fileUploadErrors.paramUserIDNotValid)
	expect(response3.body.error).toEqual(fileUploadErrors.paramUserIDNotValid)
})

test("invalid request passing invalid shareID", async () => {
	const response1 = await request(defaultExpressApp)
		.post(`/users/${uuid()}/shares/false/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")
		.send()

	const response2 = await request(defaultExpressApp)
		.post(`/users/${uuid()}/shares/42.2/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")
		.send()

	const response3 = await request(defaultExpressApp)
		.post(`/users/${uuid()}/shares/abcd-efgh/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")
		.send()

	expect(response1.status).toBe(HTTPStatusCodes.BAD_REQUEST)
	expect(response2.status).toBe(HTTPStatusCodes.BAD_REQUEST)
	expect(response3.status).toBe(HTTPStatusCodes.BAD_REQUEST)

	expect(response1.body.error).toEqual(fileUploadErrors.paramShareIDNotValid)
	expect(response2.body.error).toEqual(fileUploadErrors.paramShareIDNotValid)
	expect(response3.body.error).toEqual(fileUploadErrors.paramShareIDNotValid)
})

test("invalid request passing no content-type", async (done) => {
	const customBodyParser: NextHandleFunction = (req, res, next) => next()
	const customRouter = fileUploadRouter({
		songFileService: passingFileService,
		uploadProcessingQueue: songUploadProcessingQueue,
		maxFileSize: 10 * 1024 * 1024,
		allowedMimeTypes: acceptedContentTypes,
		bodyParser: customBodyParser,
		auth: mockedAuth,
	})
	const expressApp = makeExpressApp({ routers: [customRouter] })
	const httpRequest = request(expressApp).post(`/users/${uuid()}/shares/${uuid()}/files/SampleAudio.mp3`)

	httpRequest.write(mp3FileBuffer)
	httpRequest.end((err, res) => {
		if (err) throw err

		expect(res.status).toBe(HTTPStatusCodes.BAD_REQUEST)
		expect(res.body.error).toEqual(fileUploadErrors.headerContentTypeMissing)

		done()
	})
})

test("valid request, but file upload fails", async (done) => {
	const failingFileService = new FileServiceMock(
		() => {
			throw new Error("Some went wrong during the file upload")
		},
		() => "",
	)
	const restRouter = fileUploadRouter({
		songFileService: failingFileService,
		uploadProcessingQueue: songUploadProcessingQueue,
		maxFileSize: 10 * 1024 * 1024,
		allowedMimeTypes: acceptedContentTypes,
		auth: mockedAuth,
	})
	const expressApp = makeExpressApp({ routers: [restRouter] })

	const httpRequest = request(expressApp)
		.post(`/users/${uuid()}/shares/${uuid()}/files/SampleAudio.mp3`)
		.set("Content-Type", "audio/mpeg")

	httpRequest.write(mp3FileBuffer)
	httpRequest.end((err, res) => {
		if (err) throw err

		expect(res.status).toBe(HTTPStatusCodes.INTERNAL_SERVER_ERROR)
		expect(res.body.error).toEqual(commonRestErrors.internalServerError)

		done()
	})
})

describe("extractPlaylistIDs", () => {
	test("no ids", () => {
		const req: any = {
			query: {},
		}
		expect(extractPlaylistIDs(req)).toEqual([])
	})
	test("1 id", () => {
		const req: any = {
			query: { playlistID: "test-id" },
		}
		expect(extractPlaylistIDs(req)).toEqual(["test-id"])
	})
	test("more ids", () => {
		const req: any = {
			query: { playlistID: ["test-id-1", "test-id-2", "test-id-3"] },
		}
		expect(extractPlaylistIDs(req)).toEqual(["test-id-1", "test-id-2", "test-id-3"])
	})
})
