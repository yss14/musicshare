import { filterNull, filterUndefined } from "../utils/array/filter-null"

test('filter null', () => {
	const testArray = [42, 'abc', null, undefined, true]

	expect(testArray.filter(filterNull)).toEqual([42, 'abc', undefined, true])
})

test('filter undefined', () => {
	const testArray = [42, 'abc', null, undefined, true]

	expect(testArray.filter(filterUndefined)).toEqual([42, 'abc', null, true])
})