import { IPeristentTokenStoreArgs, PeristentTokenStore } from "./TokenStore";

export interface IAuthTokenStore {
	load(): Promise<void>;
	persist(): Promise<void>;
	isInvalid(token: string): boolean;
	invalidate(token: string): void;
}

export const AuthTokenStore = (args: IPeristentTokenStoreArgs): IAuthTokenStore => {
	const { addToken, hasToken, load, persist } = PeristentTokenStore(args);

	return {
		load,
		persist,
		isInvalid: hasToken,
		invalidate: addToken,
	}
}