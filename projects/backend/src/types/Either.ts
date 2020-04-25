export interface Either<K, V> {
	left: K | undefined
	right: V | undefined
}

interface EitherLeft<K> extends Either<K, undefined> {
	left: K
	right: undefined
}

interface EitherRight<V> extends Either<undefined, V> {
	left: undefined
	right: V
}

export const left = <K>(value: K): EitherLeft<K> => ({ left: value, right: undefined })
export const right = <V>(value: V): EitherRight<V> => ({ left: undefined, right: value })

export const isLeft = <K, V>(obj: Either<K, V>): obj is EitherLeft<K> => {
	return obj.left !== undefined
}

export const isRight = <K, V>(obj: Either<K, V>): obj is EitherRight<V> => {
	return obj.right !== undefined
}
