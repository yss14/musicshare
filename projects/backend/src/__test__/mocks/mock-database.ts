import { IDatabaseClient } from "cassandra-schema-builder";

export const makeMockedDatabase = (): IDatabaseClient => ({
	execute: jest.fn(),
	query: jest.fn(),
	close: jest.fn(),
})