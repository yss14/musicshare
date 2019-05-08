import { IDatabaseClient } from "cassandra-schema-builder";
import { TokensByShareTable } from "../database/schema/tables";

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
	tokenGroup: string;
}

export const PeristentTokenStore = ({ database, tokenGroup }: IPeristentTokenStoreArgs): IPersistentTokenStore => {
	let tokenCache = new Set<string>();
	let tokensSinceLastPersist: string[] = [];

	const load = async () => {
		const dbResults = await database.query(TokensByShareTable.select('*', ['group'])([tokenGroup]));

		tokenCache = new Set<string>(dbResults.map(dbResult => dbResult.token_value));
	}

	const persist = async () => {
		const insertQueries = tokensSinceLastPersist.map(token =>
			TokensByShareTable.insert(['group', 'token_value'])([tokenGroup, token]));

		await database.query(TokensByShareTable.batch(insertQueries));

		tokensSinceLastPersist = [];
	}

	const addToken = (token: string) => {
		tokenCache.add(token);
		tokensSinceLastPersist.push(token);
	}

	const hasToken = (token: string) => tokenCache.has(token);

	return { load, persist, addToken, hasToken };
}