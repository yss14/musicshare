export const createPrefilledArray = <T>(numberOfElement: number, value: T): Array<T> => {
	return new Array<T>(numberOfElement).fill(value)
}
