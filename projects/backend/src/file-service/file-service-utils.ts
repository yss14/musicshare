import validator from "validator"
import { last } from "lodash"
import { InvalidBlobUrlError } from "./FileService"

const tryParseUrl = (url: string) => {
	try {
		return new URL(url)
	} catch (err) {
		if (err.code === "ERR_INVALID_URL") {
			throw new InvalidBlobUrlError(url)
		}

		throw err
	}
}

export const extractBlobNameFromUrl = (url: string) => {
	const parsedUrl = tryParseUrl(url)
	const pathname = parsedUrl.pathname

	if (!validator.isURL(url, { require_tld: false }) || !pathname || pathname === "/") {
		throw new InvalidBlobUrlError(url)
	}

	const pathnameSplit = pathname.split("/")
	const filenameRemote = last(pathnameSplit)

	return filenameRemote!
}
