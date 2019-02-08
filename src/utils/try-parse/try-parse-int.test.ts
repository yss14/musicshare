import { tryParseInt, InvalidIntegerError } from "./try-parse-int";

test('positive number', () => {
	const result = tryParseInt("42");

	expect(result).toBe(42);
});

test('zero', () => {
	const resultPositive = tryParseInt("0");
	const resultNegative = tryParseInt("-0");

	expect(resultPositive).toBe(0);
	expect(resultNegative).toBe(-0);
});

test('negative number', () => {
	const result = tryParseInt("-42");

	expect(result).toBe(-42);
});

test('floating point number', () => {
	const result = tryParseInt("23.67");

	expect(result).toBe(23);
});

test('invalid integer without default value', () => {
	const throwingParseFunction = () => tryParseInt('abcd42');

	expect(throwingParseFunction).toThrowError(InvalidIntegerError);
});

test('invalid integer with default value', () => {
	const result = tryParseInt('abcd42', 42);

	expect(result).toBe(42);
});

test('empty string', () => {
	const throwingParseFunction = () => tryParseInt('');

	expect(throwingParseFunction).toThrowError(InvalidIntegerError);
});

test('undefined', () => {
	const throwingParseFunction = () => tryParseInt(undefined);

	expect(throwingParseFunction).toThrowError(InvalidIntegerError);
});