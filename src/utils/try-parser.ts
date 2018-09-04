export const tryParseInt = (str: string, defaultValue?: number): number => {
	let retValue = defaultValue;

	if (str !== null) {
		if (str.length > 0) {
			let parsed = parseInt(str);

			if (!isNaN(parsed)) {
				retValue = parsed;
			}
		}
	}
	return retValue;
}