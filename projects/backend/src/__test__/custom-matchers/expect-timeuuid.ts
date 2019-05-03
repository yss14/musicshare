import { TimeUUID } from "../../types/TimeUUID";

expect.extend({
	toBeTimeUUID: function (this: jest.MatcherUtils, received): jest.CustomMatcherResult {
		expect(received).toBeDefined();
		expect(received).toBeString();

		try {
			TimeUUID(received);
		} catch (err) {
			return { pass: false, message: err.toString() };
		}

		return { pass: !this.isNot, message: 'Expected to be a valid timeuuid' };
	}
});