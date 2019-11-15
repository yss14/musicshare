import React from "react";
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloProviderHooks } from "@apollo/react-hooks";
import { Router } from "react-router-dom";
import { client, cache } from "./Apollo";
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { makeConfigFromEnv } from "./config";
import { ThemeProvider } from "styled-components";
import { ConfigContext } from "./context/configContext";
import { Routing } from "./components/routing/Routing";
import { PlayerContext } from "./player/player-context";
import { Player } from "./player/player";
import { IPrimaryTheme } from "./types/Theme";
import { history } from "./components/routing/history";

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

const theme: IPrimaryTheme = {
	main: "#275dad",
	white: "#ffffff",
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
							<DndProvider backend={HTML5Backend}>
								<Router history={history}>
									<Routing />
								</Router>
							</DndProvider>
						</PlayerContext.Provider>
					</ConfigContext.Provider>
				</ThemeProvider>
			</ApolloProviderHooks>
		</ApolloProvider>
	);
};

export default App;
