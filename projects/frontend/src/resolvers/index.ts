import { MutationContext } from "react-apollo";
import gql from "graphql-tag";
import { InMemoryCache } from "apollo-cache-inmemory";
import {
  ITodoVariables,
  IEmailVariables,
  IVisibilityVariables,
  IShareVariables
} from "./types";

// CLIENT RESOLVERS FOR LOCAL STATE

// These are just sample implementations of resolvers that should be split up into seperate files later.
interface ITodo {
  completed: boolean;
}

const GET_CART_ITEMS = gql`
  query GetCartItems {
    cartItems @client
  }
`;

export const resolvers = {
  Mutation: {
    toggleTodo: (
      _: any,
      { id }: ITodoVariables,
      { cache, getCacheKey }: { cache: InMemoryCache; getCacheKey: any }
    ) => {
      const cacheId = getCacheKey({ __typename: "TodoItem", id });
      const fragment = gql`
        fragment completeTodo on TodoItem {
          completed
        }
      `;
      const todo: ITodo | null = cache.readFragment({ fragment, id: cacheId });
      if (todo) {
        const data = { ...todo, completed: !todo.completed };
        cache.writeData({ id, data });
      }
      return null;
    },
    updateUserEmail: (
      _: any,
      { id, email }: IEmailVariables,
      { cache }: { cache: InMemoryCache }
    ) => {
      const data = { email };
      //cache key should be __typename:id
      cache.writeData({ id: `User:${id}`, data });
    },
    updateVisibilityFilter: (
      _: any,
      { visibilityFilter }: IVisibilityVariables,
      { cache }: { cache: InMemoryCache }
    ) => {
      const data = { visibilityFilter, __typename: "Filter" };
      cache.writeData({ data });
    },
    updateShareId: (
      _: any,
      { shareId }: IShareVariables,
      { cache }: { cache: InMemoryCache }
    ) => {
      const data = { shareId, __typename: "Share" };
      cache.writeData({ data });
    }
  }
};
