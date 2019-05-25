import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { InMemoryCache } from "apollo-cache-inmemory";

export interface ILoginVariables {
  password: string;
  email: string;
}

export interface ILoginData {
  login: {
    authToken: string;
    refreshToken: string;
  };
}

export const LOGIN = gql`
  mutation login($password: String!, $email: String!) {
    login(password: $password, email: $email) {
      authToken
      refreshToken
    }
  }
`;

export const useLogin = ({ password, email }: ILoginVariables) => {
  return useMutation(LOGIN, {
    variables: { password, email },
    update: (cache: InMemoryCache, { data }: { data: ILoginData }) => {
      cache.writeData({
        data: {
          authToken: data.login.authToken,
          refreshToken: data.login.refreshToken
        }
      });
      localStorage.setItem("auth-token", data.login.authToken);
      localStorage.setItem("refresh-token", data.login.refreshToken);
    }
  });
};
