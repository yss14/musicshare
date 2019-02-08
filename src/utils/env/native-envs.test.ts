import { isProductionEnvironment, isValidNodeEnvironment } from "./native-envs";
import { NodeEnv } from "../../types/common-types";

describe('isProductionEnvironment()', () => {
	test('development environment', () => {
		process.env.NODE_ENV = NodeEnv.Development;
		const isProdEnv = isProductionEnvironment();

		expect(isProdEnv).toBe(false);
	});

	test('testing environment', () => {
		process.env.NODE_ENV = NodeEnv.Testing;
		const isProdEnv = isProductionEnvironment();

		expect(isProdEnv).toBe(false);
	});

	test('production environment', () => {
		process.env.NODE_ENV = NodeEnv.Production;
		const isProdEnv = isProductionEnvironment();

		expect(isProdEnv).toBe(true);
	});
});

describe('isValidNodeEnvironment()', () => {
	test('development', () => {
		const isValidNodeEnv = isValidNodeEnvironment('development');

		expect(isValidNodeEnv).toBe(true);
	});

	test('testing', () => {
		const isValidNodeEnv = isValidNodeEnvironment('testing');

		expect(isValidNodeEnv).toBe(true);
	});

	test('production', () => {
		const isValidNodeEnv = isValidNodeEnvironment('production');

		expect(isValidNodeEnv).toBe(true);
	});

	test('invalid node environment', () => {
		const isValidNodeEnv = isValidNodeEnvironment('someinvalidenv');

		expect(isValidNodeEnv).toBe(false);
	});

	test('empty string', () => {
		const isValidNodeEnv = isValidNodeEnvironment('');

		expect(isValidNodeEnv).toBe(false);
	});

	test('undefined', () => {
		const isValidNodeEnv = isValidNodeEnvironment(undefined);

		expect(isValidNodeEnv).toBe(false);
	});
});