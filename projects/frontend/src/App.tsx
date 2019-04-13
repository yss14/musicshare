import React, { Component, useState } from "react";
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { resolvers } from "./resolvers";
import { BrowserRouter as Router } from "react-router-dom";

import { makeConfigFromEnv } from "./config";
import gql from "graphql-tag";
import Routing from "./Routing";
import { Icon, Layout, Typography } from "antd";
import "./antd.css";
import Menu from "./components/Menu";

const { Header, Sider, Footer, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
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

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => {
    setCollapsed(collapsed => !collapsed);
  };
  return (
    <ApolloProvider client={client}>
      <Router>
        <Layout>
          <Header style={{ position: "fixed", zIndex: 10, width: "100%" }}>
            header
          </Header>
          <Layout>
            <Sider
              theme="light"
              collapsible
              style={{
                marginTop: "64px",
                marginBottom: "48px",
                height: "calc(100% - 64px)",
                position: "fixed",
                zIndex: 9,
                left: 0
              }}
              collapsed={collapsed}
              onCollapse={toggleCollapse}
            >
              <Menu />
              <Icon
                style={{
                  fontSize: "18px",
                  lineHeight: "64px",
                  padding: "0 24px",
                  width: "100%",
                  borderRight: "1px solid #e8e8e8"
                }}
                type={collapsed ? "menu-unfold" : "menu-fold"}
                onClick={toggleCollapse}
              />
            </Sider>
            <Content
              style={{
                marginTop: "64px",
                marginLeft: collapsed ? "80px" : "200px"
              }}
            >
              <Routing />
            </Content>
          </Layout>

          <Footer
            style={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              zIndex: 10,
              height: "48px"
            }}
          >
            <Paragraph>Footer</Paragraph>
          </Footer>
        </Layout>
      </Router>
    </ApolloProvider>
  );
};

export default App;
