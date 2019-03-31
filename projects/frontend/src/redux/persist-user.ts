import { IStoreSchema } from "./store.schema";
import { IUserSchema } from "./user/user.schema";
import { Store } from "redux";

const localStorageKey = 'musicshare:user';

export const persistUser = (store: Store<IStoreSchema>) => {
	store.subscribe(() => {
		localStorage.setItem(localStorageKey, JSON.stringify(store.getState().user));
	});
}

export const getPersistentUser = (defaultValue: IUserSchema): IUserSchema => {
	try {
		const userFromStorage = localStorage.getItem(localStorageKey);

		if (userFromStorage) {
			const parsedJSON = JSON.parse(userFromStorage);

			return parsedJSON;
		}
	} catch (err) {
		console.error(err);
	}

	return defaultValue;
}