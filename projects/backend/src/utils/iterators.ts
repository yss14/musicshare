export const zip = function*<A, B>(as: Iterable<A>, bs: Iterable<B>): IterableIterator<[A, B]> {
	const itera = as[Symbol.iterator]();
	const iterb = bs[Symbol.iterator]();
	for (; ;) {
		const a = itera.next();
		if (a.done) {
			return;
		}
		const b = iterb.next();
		if (b.done) {
			return;
		}
		yield [a.value, b.value];
	}
};