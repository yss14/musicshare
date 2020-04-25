export const jsonParsedObject = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))
