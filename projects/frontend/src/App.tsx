import React, { useMemo } from "react"
import { ApolloProvider } from "@apollo/client"
import { Router } from "react-router-dom"
import { client, cache } from "./Apollo"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { makeConfigFromEnv } from "./config"
import { ThemeProvider, createGlobalStyle } from "styled-components"
import { ConfigContext } from "./context/configContext"
import { Routing } from "./components/routing/Routing"
import { IPrimaryTheme } from "./types/Theme"
import { history } from "./components/routing/history"
import {
	IAuthTokenData,
	GET_AUTH_TOKEN,
	IRefreshTokenData,
	GET_REFRESH_TOKEN,
} from "./graphql/client/queries/auth-token-query"
import { GraphQLClient, GraphQLClientContext } from "@musicshare/graphql-client"
import { ReactQueryConfigProvider, ReactQueryProviderConfig } from "react-query"
import { ReactQueryDevtools } from "react-query-devtools"

const config = makeConfigFromEnv()

const GlobalStyle = createGlobalStyle`
	html, body, #root{
		width: 100%;
		height: 100%;
		margin: 0px;
		padding: 0px;

  		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  		-webkit-font-smoothing: antialiased;
  		-moz-osx-font-smoothing: grayscale;
	}

	.ant-popover-content-nopadding .ant-popover-inner-content{
		padding: 0px !important;
	}
`

cache.writeQuery<IAuthTokenData>({
	query: GET_AUTH_TOKEN,
	data: {
		authToken: localStorage.getItem("auth-token"),
	},
})
cache.writeQuery<IRefreshTokenData>({
	query: GET_REFRESH_TOKEN,
	data: {
		refreshToken: localStorage.getItem("refresh-token"),
	},
})

const theme: IPrimaryTheme = {
	main: "#275dad",
	white: "#ffffff",
	lightgrey: "#aba9c3",
	grey: "#ced3dc",
	darkgrey: "#474350",
}

const queryConfig: ReactQueryProviderConfig = {
	queries: {
		refetchOnWindowFocus: false,
		retry: 1,
	},
}

export const App = () => {
	const graphQLClient = useMemo(() => {
		const client = GraphQLClient({ baseURL: config.services.musicshare.backendURL })

		client.useRequestMiddleware((request) => {
			request.headers["Authorization"] = localStorage.getItem("auth-token")

			return request
		})

		return client
	}, [])

	return (
		<ReactQueryConfigProvider config={queryConfig}>
			<GraphQLClientContext.Provider value={graphQLClient}>
				<GlobalStyle />
				<ReactQueryDevtools />
				<ApolloProvider client={client}>
					<ThemeProvider theme={theme}>
						<ConfigContext.Provider value={config}>
							<DndProvider backend={HTML5Backend}>
								<Router history={history}>
									<Routing />
								</Router>
							</DndProvider>
						</ConfigContext.Provider>
					</ThemeProvider>
				</ApolloProvider>
			</GraphQLClientContext.Provider>
		</ReactQueryConfigProvider>
	)
}
