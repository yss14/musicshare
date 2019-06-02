declare namespace jest {
	interface Matchers<R> {
		toBeUUID(): CustomMatcherResult;
	}

	interface Expect {
		toBeUUID(): void;
	}
}