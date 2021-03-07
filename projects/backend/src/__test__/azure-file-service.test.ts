import { ChildProcess, spawn } from "child_process"
import * as path from "path"
import { AzureFileService } from "../file-service/AzureFileService"
import * as fs from "fs"
import { urlIsReachable } from "./utils/url-is-reachable"
import moment from "moment"
import { v4 as uuid } from "uuid"
import * as azBlob from "azure-storage"

const fsPromises = fs.promises

const startAzurite = () => {
	return new Promise<ChildProcess>((resolve, reject) => {
		const childProcess = spawn("azurite-blob", ["-l", "azurite_test"])

		childProcess.stderr!.on("data", (data) => reject(data))

		resolve(childProcess)
	})
}

const TIMEOUT = 20000

let azuriteProcess: ChildProcess | null = null

beforeAll(async () => {
	if (!process.env.IS_CI) {
		azuriteProcess = await startAzurite()
	}
})

afterAll(async () => {
	if (azuriteProcess) {
		azuriteProcess.kill()

		await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))
	}
})

describe("instance creation", () => {
	test("single instance", async () => {
		const container = "single-instance"
		const fileService = new AzureFileService(container)
		await fileService.createContainerIfNotExists()
	})

	test("two instances same container", async () => {
		const container = "two-instances-same-container"
		const fileService = new AzureFileService(container)
		await fileService.createContainerIfNotExists()
		await fileService.createContainerIfNotExists()
	})

	test("invalid container name", async () => {
		const container = "invalid_container%-name"
		const fileService = new AzureFileService(container)

		await expect(fileService.createContainerIfNotExists()).rejects.toThrow(SyntaxError)
	})
})

describe("file upload", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")
	const container = "testupload"

	test(
		"upload mp3 file",
		async () => {
			const fileService = new AzureFileService(container)
			await fileService.createContainerIfNotExists()

			await fileService.uploadFile({
				filenameRemote: "SampleAudio.mp3",
				contentType: "audio/mp3",
				source: fs.createReadStream(mp3FilePath),
			})
		},
		TIMEOUT,
	)

	test(
		"upload already existing file",
		async () => {
			const fileService = new AzureFileService(container)
			await fileService.createContainerIfNotExists()

			await fileService.uploadFile({
				filenameRemote: "AlreadyExisting.mp3",
				contentType: "audio/mp3",
				source: fs.createReadStream(mp3FilePath),
			})

			await fileService.uploadFile({
				filenameRemote: "AlreadyExisting.mp3",
				contentType: "audio/mp3",
				source: fs.createReadStream(mp3FilePath),
			})
		},
		TIMEOUT,
	)

	test(
		"blob api throws error for write stream creation",
		async () => {
			const blobService = azBlob.createBlobService()
			blobService.createWriteStreamToBlockBlob = <any>jest.fn(
				(container: string, blob: string, opts: any, callback: (err: Error) => void) => {
					callback(new Error("Cannot create write stream to block blob"))
				},
			)
			const fileService = new AzureFileService(container, blobService)
			await fileService.createContainerIfNotExists()

			await expect(
				fileService.uploadFile({
					filenameRemote: "AlreadyExisting.mp3",
					contentType: "audio/mp3",
					source: fs.createReadStream(mp3FilePath),
				}),
			).rejects.toThrowError("Cannot create write stream to block blob")
		},
		TIMEOUT,
	)
})

describe("get url to file", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")
	const container = "testupload"

	test("get url to uploaded file", async () => {
		const fileService = new AzureFileService(container)
		await fileService.createContainerIfNotExists()
		const filenameRemote = "SomeFile.mp3"

		await fileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})

		const urlToFile = await fileService.getLinkToFile({
			filenameRemote,
			expireDate: moment().add(20, "seconds"),
		})

		const urlToFileIsReachable = await urlIsReachable(urlToFile)

		expect(urlToFileIsReachable).toBeTruthy()
	})

	test("get uploadable url", async () => {
		const fileService = new AzureFileService(container)
		const filenameRemote = "SomeFile.mp3"

		const urlToFile = await fileService.getLinkToFile({
			filenameRemote,
			expireDate: moment().add(20, "seconds"),
			permission: "write",
		})

		expect(urlToFile).toBeString()
	})

	test("get url to uploaded file expired", async () => {
		const fileService = new AzureFileService(container)
		await fileService.createContainerIfNotExists()
		const filenameRemote = "SomeFile.mp3"

		await fileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})

		const urlToFile = await fileService.getLinkToFile({
			filenameRemote,
			expireDate: moment().add(-20, "seconds"),
		})

		const urlToFileIsReachable = await urlIsReachable(urlToFile)

		expect(urlToFileIsReachable).toBeFalsy()
	})

	test("get url to uploaded file no end date specified", async () => {
		const fileService = new AzureFileService(container)
		await fileService.createContainerIfNotExists()
		const filenameRemote = "SomeFile.mp3"

		await fileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})

		const urlToFile = await fileService.getLinkToFile({ filenameRemote })

		await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))

		const urlToFileIsReachable = await urlIsReachable(urlToFile)

		expect(urlToFileIsReachable).toBeFalsy()
	})

	test("get url with browser host specified", async () => {
		const browserHost = "http://localhost:1337"
		const fileService = new AzureFileService(container, undefined, browserHost)
		await fileService.createContainerIfNotExists()
		const filenameRemote = "SomeFile.mp3"

		await fileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})

		const urlToFile = await fileService.getLinkToFile({ filenameRemote })

		expect(urlToFile).toMatch(new RegExp(browserHost))
	})
})

describe("get file as buffer", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")
	const container = "testupload"

	test(
		"get existing file as buffer",
		async () => {
			const fileService = new AzureFileService(container)
			await fileService.createContainerIfNotExists()

			const filenameRemote = "file-" + uuid().split("-").join("") + ".mp3"

			await fileService.uploadFile({
				filenameRemote: filenameRemote,
				contentType: "audio/mp3",
				source: fs.createReadStream(mp3FilePath),
			})

			const readBuffer = await fsPromises.readFile(mp3FilePath)
			const receivedBuffer = await fileService.getFileAsBuffer(filenameRemote)

			expect(receivedBuffer.equals(readBuffer)).toBe(true)
		},
		TIMEOUT,
	)

	test(
		"get not-existing file as buffer",
		async () => {
			const fileService = new AzureFileService(container)
			await fileService.createContainerIfNotExists()

			await expect(fileService.getFileAsBuffer("some-not-existing-file.mp3")).rejects.toThrow()
		},
		TIMEOUT,
	)
})

describe("remove file", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")

	test("remove existing file succeeds", async () => {
		const fileService = new AzureFileService(uuid())
		await fileService.createContainerIfNotExists()

		const filenameRemote = "file-" + uuid().split("-").join("") + ".mp3"

		await fileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})

		await fileService.removeFile(filenameRemote)

		await expect(fileService.getFileAsBuffer(filenameRemote)).rejects.toThrow()
	})

	test("remove not existing file succeeds", async () => {
		const fileService = new AzureFileService(uuid())
		await fileService.createContainerIfNotExists()

		const filenameRemote = "file-" + uuid().split("-").join("") + ".mp3"

		await fileService.removeFile(filenameRemote)
	})
})
