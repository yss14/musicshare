import React from "react";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloProviderHooks } from '@apollo/react-hooks';
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { resolvers } from "./resolvers";
import { BrowserRouter as Router } from "react-router-dom";

import { makeConfigFromEnv } from "./config";
import AppWrapper from "./AppWrapper";
import { ThemeProvider } from "styled-components";
import { ConfigContext } from "./context/configContext";

const config = makeConfigFromEnv();

const typeDefs = `
	type SongUpdateInput {
		title: String
		suffix: String
		year: Float
		bpm: Float
		releaseDate: String
		isRip: Boolean
		artists: [String!]
		remixer: [String!]
		featurings: [String!]
		type: String
		genres: [String!]
		label: String
		tags: [String!]
	}
`;

const cache = new InMemoryCache();
const client = new ApolloClient({
	link: ApolloLink.from([
		onError(({ graphQLErrors, networkError }) => {
			if (graphQLErrors)
				graphQLErrors.map(({ message, locations, path }) =>
					console.log(
						`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
					)
				);
			if (networkError) console.log(`[Network error]: ${networkError}`);
		}),
		new HttpLink({
			uri: config.services.musicshare.backendURL,
			headers: {
				authorization: config.services.musicshare.authTokenDev
			}
		})
	]),
	cache,
	resolvers,
	typeDefs,
});

//initial cache data
const data = {
	todos: [],
	userId: "f0d8e1f0-aeb1-11e8-a117-43673ffd376b",
	shareId: "",
	visibilityFilter: "SHOW_ALL",
	networkStatus: {
		__typename: "NetworkStatus",
		isConnected: false
	}
};

cache.writeData({ data });

client.onResetStore(async () => cache.writeData({ data }));

const theme = {
	main: "#275dad",
	white: "#ffffff",
	y: "#fcf7f8",
	lightgrey: "#aba9c3",
	grey: "#ced3dc",
	darkgrey: "#474350"
};

const App = () => {
	return (
		<ApolloProvider client={client}>
			<ApolloProviderHooks client={client}>
				<ThemeProvider theme={theme}>
					<ConfigContext.Provider value={config}>
						<Router>
							<AppWrapper />
						</Router>
					</ConfigContext.Provider>
				</ThemeProvider>
			</ApolloProviderHooks>
		</ApolloProvider>
	);
};

export default App;
