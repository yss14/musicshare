declare namespace jest {
	interface Matchers<R> {
		toBeTimeUUID(): CustomMatcherResult;
	}

	interface Expect {
		toBeTimeUUID(): void;
	}
}