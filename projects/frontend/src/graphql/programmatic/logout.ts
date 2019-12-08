import ApolloClient from "apollo-client"

export const logoutUser = (client: ApolloClient<object>) => {
	localStorage.removeItem("auth-token")
	localStorage.removeItem("refresh-token")

	client.writeData({
		data: {
			authToken: null,
			refreshToken: null,
		}
	});
}