import React from "react"
import { ApolloProvider } from "@apollo/client"
import { Router } from "react-router-dom"
import { client } from "./Apollo"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { makeConfigFromEnv } from "./config"
import { ThemeProvider, createGlobalStyle } from "styled-components"
import { ConfigContext } from "./context/configContext"
import { Routing } from "./components/routing/Routing"
import { IPrimaryTheme } from "./types/Theme"
import { history } from "./components/routing/history"
import { ReactQueryConfigProvider, ReactQueryConfig } from "react-query"
import { ReactQueryDevtools } from "react-query-devtools"
import { GraphQLClientProvider } from "./GraphqlClientProvider"
import { GraphQLClient, GraphQLClientContext } from "@musicshare/graphql-client"

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

const theme: IPrimaryTheme = {
	main: "#275dad",
	white: "#ffffff",
	lightgrey: "#aba9c3",
	grey: "#ced3dc",
	darkgrey: "#474350",
}

const queryConfig: ReactQueryConfig = {
	queries: {
		refetchOnWindowFocus: false,
		retry: 1,
	},
}

export const App = () => (
	<ReactQueryConfigProvider config={queryConfig}>
		<ConfigContext.Provider value={config}>
			<GraphQLClientContext.Provider value={GraphQLClient({ baseURL: config.services.musicshare.backendURL })}>
				<GraphQLClientProvider>
					<GlobalStyle />
					<ReactQueryDevtools />
					<ApolloProvider client={client}>
						<ThemeProvider theme={theme}>
							<DndProvider backend={HTML5Backend}>
								<Router history={history}>
									<Routing />
								</Router>
							</DndProvider>
						</ThemeProvider>
					</ApolloProvider>
				</GraphQLClientProvider>
			</GraphQLClientContext.Provider>
		</ConfigContext.Provider>
	</ReactQueryConfigProvider>
)
