import { filterNull, filterUndefined } from "../utils/array/filter-null"
import { extractBlobNameFromUrl } from "../file-service/file-service-utils"
import { InvalidBlobUrlError } from "../file-service/FileService"

test("filter null", () => {
	const testArray = [42, "abc", null, undefined, true]

	expect(testArray.filter(filterNull)).toEqual([42, "abc", undefined, true])
})

test("filter undefined", () => {
	const testArray = [42, "abc", null, undefined, true]

	expect(testArray.filter(filterUndefined)).toEqual([42, "abc", null, true])
})

describe("file service utils", () => {
	test("invalid url throws", () => {
		const url = "abcd"

		expect(() => extractBlobNameFromUrl(url)).toThrowError(InvalidBlobUrlError)
	})

	test("url without pathname throws", () => {
		const url = "http://google.com"

		expect(() => extractBlobNameFromUrl(url)).toThrowError(InvalidBlobUrlError)
	})
})
