import { IDatabaseClient } from "postgres-schema-builder";
import { ShareTokensTable } from "../database/tables";

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
		const dbResults = await database.query(ShareTokensTable.select('*', ['group'])([tokenGroup]));

		tokenCache = new Set<string>(dbResults.map(dbResult => dbResult.token_value));
	}

	const persist = async () => {
		const insertQueries = tokensSinceLastPersist.map(token =>
			ShareTokensTable.insert(['group', 'token_value'])([tokenGroup, token]));

		await database.batch(insertQueries);

		tokensSinceLastPersist = [];
	}

	const addToken = (token: string) => {
		tokenCache.add(token);
		tokensSinceLastPersist.push(token);
	}

	const hasToken = (token: string) => tokenCache.has(token);

	return { load, persist, addToken, hasToken };
}