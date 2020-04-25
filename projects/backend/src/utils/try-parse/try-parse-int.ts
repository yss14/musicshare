export class InvalidIntegerError extends Error {
	constructor(stringToParse: string | undefined) {
		super(`Value ${stringToParse} can not be parsed as an integer value`)
	}
}

type ITryParseIntOverload = {
	(stringToParse: string | undefined): number
	(stringToParse: string | undefined, defaultValue: number): number
}

export const tryParseInt: ITryParseIntOverload = (stringToParse: string | undefined, defaultValue?: number): number => {
	let returnValue = defaultValue

	if (stringToParse) {
		let parsed = parseInt(stringToParse)

		if (!isNaN(parsed)) {
			returnValue = parsed
		}
	}

	if (returnValue === undefined) {
		throw new InvalidIntegerError(stringToParse)
	} else {
		return returnValue
	}
}
