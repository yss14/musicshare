export function filterNull<Value>(value: Value | null): value is Value {
	return value !== null
}

export function filterUndefined<Value>(value: Value | undefined): value is Value {
	return value !== undefined
}
