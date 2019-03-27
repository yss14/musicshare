import { isString } from "../type-guards";

test('isString', () => {
	const values = [42, 'hello world', '', false, null, undefined, Buffer.from(''), new Date()];
	const filtered = values.filter(isString);

	expect(filtered).toEqual(['hello world', '']);
});