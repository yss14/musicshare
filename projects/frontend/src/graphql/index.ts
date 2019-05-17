import { InMemoryCache } from "apollo-cache-inmemory";
import {
	IEmailVariables,
	IVisibilityVariables,
	IShareVariables
} from "./types";

export const resolvers = {
	Mutation: {
		updateUserEmail: (
			_: any,
			{ id, email }: IEmailVariables,
			{ cache }: { cache: InMemoryCache }
		) => {
			const data = { email };
			//cache key should be __typename:id
			cache.writeData({ id: `User:${id}`, data });
		},
		updateVisibilityFilter: (
			_: any,
			{ visibilityFilter }: IVisibilityVariables,
			{ cache }: { cache: InMemoryCache }
		) => {
			const data = { visibilityFilter, __typename: "Filter" };
			cache.writeData({ data });
		},
		updateShareId: (
			_: any,
			{ shareId }: IShareVariables,
			{ cache }: { cache: InMemoryCache }
		) => {
			cache.writeData({ data: { shareId } });
		}
	}
};
