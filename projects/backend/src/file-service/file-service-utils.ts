import validator from "validator"
import * as URL from "url"
import { last } from "lodash"
import { InvalidBlobUrlError } from "./FileService"

export const extractBlobNameFromUrl = (url: string) => {
	const parsedUrl = URL.parse(url)
	const pathname = parsedUrl.pathname

	if (!validator.isURL(url) || !pathname || pathname === "/") {
		throw new InvalidBlobUrlError(url)
	}

	const pathnameSplit = pathname.split("/")
	const filenameRemote = last(pathnameSplit)

	return filenameRemote!
}
