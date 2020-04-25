export const isStringArray = (obj: any): obj is string[] =>
	Array.isArray(obj) && obj.every((item) => typeof item === "string")
