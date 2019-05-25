import React from "react";
import { ApolloProvider as ApolloProviderHooks } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { resolvers } from "./graphql/client/resolvers";
import { BrowserRouter as Router } from "react-router-dom";

import { makeConfigFromEnv } from "./config";
import { ThemeProvider } from "styled-components";
import { ConfigContext } from "./context/configContext";
import Routing from "./Routing";

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

const httpLink = new HttpLink({
  uri: config.services.musicshare.backendURL,
  headers: {
    headers: {
      authorization: localStorage.getItem("auth-token") || ""
    }
  }
});

const authMiddlewareLink = setContext(() => {
  const token = localStorage.getItem("auth-token");
  const headers = {
    headers: {
      authorization: token || ""
    }
  };

  return headers;
});

const afterwareLink = new ApolloLink((operation, forward) =>
  forward
    ? forward(operation).map(response => {
        const context = operation.getContext();
        const {
          response: { headers }
        } = context;

        if (headers) {
          const token = headers.get("auth-token");
          const refreshToken = headers.get("refresh-token");

          if (token) {
            localStorage.setItem("auth-token", token);
          }

          if (refreshToken) {
            localStorage.setItem("refresh-token", refreshToken);
          }
        }

        return response;
      })
    : null
);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors && graphQLErrors.filter(e => e).length > 0)
    graphQLErrors.map(({ message = "", extensions, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      if (
        "Access denied! You need to be authorized to perform this action!" ===
        message
      ) {
        console.log(window.location.pathname);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      if ("FORBIDDEN" === message && extensions && extensions.code === 403) {
        //history.push(`/error-page/403`);
        window.location.href = "/error-page";
      }
      return null;
    });
  if (networkError) {
    // eslint-disable-next-line
    //window.location.href = "/login";
    console.warn("UNAUTHORIZED");
    console.log(`[Network error]: ${networkError}`);
  }
  if (networkError) {
    // Do something
    console.warn("FORBIDDEN");
  }
  if (networkError) {
    // eslint-disable-next-line
    console.warn("SERVER ERROR");
  }
});

const cache = new InMemoryCache();
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authMiddlewareLink, httpLink]),
  cache,
  resolvers,
  typeDefs
});

export { client, cache };
