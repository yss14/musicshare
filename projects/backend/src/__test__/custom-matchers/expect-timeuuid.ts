import { isUUID } from "../../type-guards/is-uuid";

expect.extend({
	toBeUUID: function (this: jest.MatcherUtils, received): jest.CustomMatcherResult {
		expect(received).toBeDefined();
		expect(received).toBeString();

		if (!isUUID(received)) {
			return { pass: false, message: 'Expected to be a valid timeuuid' };
		}

		return { pass: !this.isNot, message: 'Expected to be a valid timeuuid' };
	}
});