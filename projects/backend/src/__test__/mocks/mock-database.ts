import { IDatabaseClient } from "postgres-schema-builder";

interface IDatabaseClientMocked extends IDatabaseClient {
	mocked: true;
}

export const makeMockedDatabase = (): IDatabaseClientMocked => ({
	execute: jest.fn(),
	query: jest.fn(),
	close: jest.fn(),
	mocked: true,
});

export const isMockedDatabase = (obj: any): obj is IDatabaseClientMocked =>
	obj.mocked === true && obj.execute !== undefined && obj.query !== undefined && obj.close !== undefined;