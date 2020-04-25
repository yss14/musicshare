import { InMemoryCache } from "apollo-cache-inmemory"

export interface IVisibilityVariables {
	visibilityFilter: string
}

export const updateVisibilityFilter = (
	_: any,
	{ visibilityFilter }: IVisibilityVariables,
	{ cache }: { cache: InMemoryCache },
) => {
	const data = { visibilityFilter, __typename: "Filter" }
	cache.writeData({ data })
}
