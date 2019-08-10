import React from "react";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloProviderHooks } from "@apollo/react-hooks";
import { BrowserRouter as Router } from "react-router-dom";
import { client, cache } from "./Apollo";

import { makeConfigFromEnv } from "./config";
import { ThemeProvider } from "styled-components";
import { ConfigContext } from "./context/configContext";
import Routing from "./Routing";
import { PlayerContext } from "./player/player-context";
import { Player } from "./player/player";

const config = makeConfigFromEnv();

//initial cache data
const data = {
	todos: [],
	authToken: localStorage.getItem("auth-token") || "",
	refreshToken: localStorage.getItem("refresh-token") || "",
	loggedIn: false,
	user: {
		id: "",
		shares: []
	},
	shareID: "",
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

const player = Player();

const App = () => {
	return (
		<ApolloProvider client={client}>
			<ApolloProviderHooks client={client}>
				<ThemeProvider theme={theme}>
					<ConfigContext.Provider value={config}>
						<PlayerContext.Provider value={player}>
							<Router>
								<Routing />
							</Router>
						</PlayerContext.Provider>
					</ConfigContext.Provider>
				</ThemeProvider>
			</ApolloProviderHooks>
		</ApolloProvider>
	);
};

export default App;
