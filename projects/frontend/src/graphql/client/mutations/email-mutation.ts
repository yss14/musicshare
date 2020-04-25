import { InMemoryCache } from "apollo-cache-inmemory"

export interface IEmailVariables {
	id: string
	email: string
}

export const updateUserEmail = (_: any, { id, email }: IEmailVariables, { cache }: { cache: InMemoryCache }) => {
	const data = { email }
	//cache key should be __typename:id
	cache.writeData({ id: `User:${id}`, data })
}
