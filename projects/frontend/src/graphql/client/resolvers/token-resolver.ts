import { InMemoryCache } from "apollo-cache-inmemory"

export interface ILoginVariables {
	shareID: string
}

export const updateTokens = (_: any, { authToken, refreshToken }: any, { cache }: { cache: InMemoryCache }) => {
	cache.writeData({ data: { authToken, refreshToken } })
}

//NOT USED
