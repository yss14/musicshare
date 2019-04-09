import React, { Component } from "react";
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { resolvers } from "./resolvers";
import "./antd.css";

import { makeConfigFromEnv } from "./config";
import Shares from "./pages/shares/Shares";
import gql from "graphql-tag";

const config = makeConfigFromEnv();

//Client side schema - only "needed" for testing with Apollo DevTools chrome Extension
const typeDefs = gql`
  extend type Query {
    todos: [any]!
    visibilityFilter: string!
  }

  extend type Mutation {
    toggleTodo(id: ID!): any
    updateVisibilityFilter(visibilityFilter: string!): any
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
      uri: config.services.musicshare.backendURL
    })
  ]),
  cache,
  typeDefs,
  resolvers
});

//initial cache data
const data = {
  todos: [],
  visibilityFilter: "SHOW_ALL",
  networkStatus: {
    __typename: "NetworkStatus",
    isConnected: false
  }
};

cache.writeData({ data });

client.onResetStore(async () => cache.writeData({ data }));

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Shares />
      </ApolloProvider>
    );
  }
}

export default App;
