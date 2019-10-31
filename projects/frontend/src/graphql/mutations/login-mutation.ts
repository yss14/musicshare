import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { DataProxy } from "apollo-cache";

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
	return useMutation<ILoginData, ILoginVariables>(LOGIN, {
		variables: { password, email },
		update: (cache: DataProxy, { data }) => {
			cache.writeData({
				data: {
					authToken: data!.login.authToken,
					refreshToken: data!.login.refreshToken
				}
			});
			localStorage.setItem("auth-token", data!.login.authToken);
			localStorage.setItem("refresh-token", data!.login.refreshToken);
		}
	});
};
