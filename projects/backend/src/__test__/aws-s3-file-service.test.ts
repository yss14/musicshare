import { S3, AWSError } from "aws-sdk"
import { AWSS3FileService } from "../file-service/AWSS3FileService"
import { configFromEnv } from "../types/config"
import { v4 as uuid } from "uuid"
import * as fs from "fs"
import * as path from "path"
import { urlIsReachable } from "./utils/url-is-reachable"
import moment from "moment"

const fsPromises = fs.promises

const config = configFromEnv()
const s3Config = {
	accessKeyId: config.fileStorage.s3!.accessKey,
	secretAccessKey: config.fileStorage.s3!.secretKey,
	endpoint: config.fileStorage.s3!.host,
	s3ForcePathStyle: true,
	signatureVersion: "v4",
}
const s3Client = new S3(s3Config)

describe("instance creation", () => {
	test("single instance", async () => {
		const container = "single-instance-" + uuid()
		const fileService = new AWSS3FileService(s3Client, container)
		await fileService.createContainerIfNotExists()

		expect(fileService.container).toBe(container)
	})

	test("two instances same container", async () => {
		const container = uuid()
		const fileService = new AWSS3FileService(s3Client, container)
		await fileService.createContainerIfNotExists()
		await fileService.createContainerIfNotExists()
	})

	test("invalid container name", async () => {
		const container = "invalid_container%-name"
		const fileService = new AWSS3FileService(s3Client, container)

		await expect(fileService.createContainerIfNotExists()).rejects.toThrow()
	})

	test("invalid credentials", async () => {
		const container = uuid()
		const config = {
			...s3Config,
			accessKeyId: "abcd",
		}
		const fileService = new AWSS3FileService(new S3(config), container)

		await expect(fileService.createContainerIfNotExists()).rejects.toThrowError(AWSError)
	})
})

describe("file upload", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")

	test("upload mp3 file", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
		await fileService.createContainerIfNotExists()

		await fileService.uploadFile({
			filenameRemote: "SampleAudio.mp3",
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})
	})

	test("upload already existing file", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
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
	})
})

describe("get url to file", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")

	test("get url to uploaded file read", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
		await fileService.createContainerIfNotExists()
		const filenameRemote = "SomeFile.mp3"

		await fileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})

		const urlToFile = await fileService.getLinkToFile({ filenameRemote, expireDate: moment().add(20, "seconds") })

		const urlToFileIsReachable = await urlIsReachable(urlToFile, "get")

		expect(urlToFileIsReachable).toBeTruthy()
	})

	test("get url to uploaded file write", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
		const filenameRemote = "SomeFile.mp3"

		const urlToFile = await fileService.getLinkToFile({
			filenameRemote,
			expireDate: moment().add(20, "seconds"),
			permission: "read",
		})

		expect(urlToFile).toBeString()
	})

	test("get url to uploaded file expired", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
		await fileService.createContainerIfNotExists()
		const filenameRemote = "SomeFile.mp3"

		await fileService.uploadFile({
			filenameRemote: filenameRemote,
			contentType: "audio/mp3",
			source: fs.createReadStream(mp3FilePath),
		})

		const urlToFile = await fileService.getLinkToFile({ filenameRemote, expireDate: moment().add(-20, "seconds") })

		const urlToFileIsReachable = await urlIsReachable(urlToFile, "get")

		expect(urlToFileIsReachable).toBeFalsy()
	})

	test("get url to uploaded file no end date specified", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
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
})

describe("get file as buffer", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")

	test("get existing file as buffer", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
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
	})

	test("get not-existing file as buffer", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
		await fileService.createContainerIfNotExists()

		await expect(fileService.getFileAsBuffer("some-not-existing-file.mp3")).rejects.toThrow()
	})
})

describe("remove file", () => {
	const mp3FilePath = path.join(__dirname, "assets", "SampleAudio.mp3")

	test("remove existing file succeeds", async () => {
		const fileService = new AWSS3FileService(s3Client, uuid())
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
		const fileService = new AWSS3FileService(s3Client, uuid())
		await fileService.createContainerIfNotExists()

		const filenameRemote = "file-" + uuid().split("-").join("") + ".mp3"

		await fileService.removeFile(filenameRemote)
	})
})
