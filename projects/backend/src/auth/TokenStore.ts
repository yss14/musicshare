import { IDatabaseClient } from "cassandra-schema-builder";

export interface ITokenStore {
	addToken(token: string): void;
	hasToken(token: string): boolean;
}

export interface IPersistentTokenStore extends ITokenStore {
	load(): Promise<void>;
	persist(): Promise<void>;
}

export interface IPeristentTokenStoreArgs {
	database: IDatabaseClient;
	tokenDescription: string;
}

export const PeristentTokenStore = ({ database }: IPeristentTokenStoreArgs): IPersistentTokenStore => {
	const tokenCache = new Set<string>();

	const load = async () => {

	}

	const persist = async () => {

	}

	const addToken = (token: string) => tokenCache.add(token);

	const hasToken = (token: string) => tokenCache.has(token);

	return { load, persist, addToken, hasToken };
}