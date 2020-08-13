import { resolvers } from "./graphql/client/resolvers"
import { makeConfigFromEnv } from "./config"
import { ISSUE_AUTH_TOKEN, IIssueAuthTokenData, IIssueAuthTokenVariables } from "./graphql/mutations/issue-auth-token"
import { getRefreshToken, GET_AUTH_TOKEN, IAuthTokenData } from "./graphql/client/queries/auth-token-query"
import { promiseToObservable } from "./graphql/utils/promise-to-observable"
import { history } from "./components/routing/history"
import { logoutUser } from "./graphql/programmatic/logout"
import { isPlaylistSong } from "./graphql/types"
import { message } from "antd"
import {
	playerStateTypeDefs,
	playerStateDefaultValue,
	persistVolume,
	IGetPlayerStateData,
	GET_PLAYER_STATE,
} from "./components/player/player-state"
import {
	ServerError,
	HttpLink,
	NormalizedCacheObject,
	InMemoryCache,
	ApolloLink,
	Observable,
	FetchResult,
	ApolloClient,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"

const config = makeConfigFromEnv()

const isServerError = (obj: any): obj is ServerError =>
	obj instanceof Error && typeof (obj as any).statusCode === "number"

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

	type InviteToShareInput {
		shareID: String!
		email: String!
	}

	type RevokeInvitationInput {
		shareID: String!
		userID: String!
	}

	type ShareIDInput {
		shareID: String!
	}

	type RemoveSongFromLibraryInput {
		shareID: String!
		songID: String!
	}

	type IncrementSongPlayCountInput {
		shareID: String!
		songID: String!
	}

	type Song {
		id: String!
		title: String!
		suffix: String
		year: Float
		bpm: Float
		dateLastEdit: String!
		releaseDate: String
		isRip: Boolean!
		artists: [String!]!
		remixer: [String!]!
		featurings: [String!]!
		type: String
		genres: [String!]!
		labels: [String!]!
		sources: [FileSource!]!
		duration: Float!
		tags: [String!]!
		dateAdded: String!
		libraryID: String!
		playCount: Int!
	}

	type ScopedSong {
		id: String!
		title: String!
		suffix: String
		year: Float
		bpm: Float
		dateLastEdit: String!
		releaseDate: String
		isRip: Boolean!
		artists: [String!]!
		remixer: [String!]!
		featurings: [String!]!
		type: String
		genres: [String!]!
		labels: [String!]!
		sources: [FileSource!]!
		duration: Float!
		tags: [String!]!
		dateAdded: String!
		libraryID: String!
		playCount: Int!
		shareID: String!
	  }

	${playerStateTypeDefs}
`

const httpLink = new HttpLink({
	uri: `${config.services.musicshare.backendURL}/graphql`,
})

interface IHTTPHeader {
	headers: {
		[key: string]: string
	}
}

const authMiddlewareLink = setContext(() => {
	const token = localStorage.getItem("auth-token")
	const headers: IHTTPHeader = {
		headers: {},
	}

	if (token) {
		headers.headers.authorization = token
	}

	return headers
})

const getNewAuthToken = (client: ApolloClient<NormalizedCacheObject>) => async () => {
	try {
		const refreshToken = await getRefreshToken(client)

		if (!refreshToken) return null

		const response = await client.mutate<IIssueAuthTokenData, IIssueAuthTokenVariables>({
			mutation: ISSUE_AUTH_TOKEN,
			variables: {
				refreshToken,
			},
			context: {
				headers: {
					authorization: undefined,
				},
			},
		})

		return response.data ? response.data.issueAuthToken : null
	} catch (err) {
		console.error(err)

		return null
	}
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }): Observable<FetchResult> | void => {
	if (graphQLErrors) {
		for (const error of graphQLErrors) {
			if (error.message === "Access denied! You need to be authorized to perform this action!") {
				if (window.location.pathname !== "/login") {
					logoutUser(client)
					message.error("You need to be authenticated to access this ressource. Please sign in!")
					history.push("/login")
				}
			} else if (error.extensions && error.extensions.code === "UNAUTHENTICATED") {
				const obs: any = promiseToObservable(getNewAuthToken(client)()).flatMap((authToken) => {
					if (authToken) {
						cache.writeQuery<IAuthTokenData>({
							query: GET_AUTH_TOKEN,
							data: {
								authToken,
							},
						})

						localStorage.setItem("auth-token", authToken)

						return forward(operation)
					} else {
						logoutUser(client)
						message.error("It seems like your session expired. Please sign in again!")
						history.push("/login")

						return Observable.of() as any
					}
				})

				return obs
			} else if (error.message.startsWith("User with id") && error.message.endsWith("not found")) {
				logoutUser(client)
				message.error("Ups, this operation failed. We logged you out for safety reasons. Please sign in again!")
				history.push("/login")
			}
		}
	}

	if (networkError) {
		if (isServerError(networkError)) {
			console.log(networkError)
		} else {
			message.warning("We detected some network issues. You may want check your internet connection.", 10)
		}
	}
})

const cache = new InMemoryCache({
	dataIdFromObject: (obj: any) => {
		if (isPlaylistSong(obj)) {
			//playlists songs can occur multiple times with the same song.id, so we utilize the playlistSongID here
			return obj.playlistSongID
		} else {
			return obj.id
		}
	},
})

const client = new ApolloClient<NormalizedCacheObject>({
	link: ApolloLink.from([errorLink, authMiddlewareLink, httpLink]),
	cache,
	resolvers,
	typeDefs,
})

cache.writeQuery<IGetPlayerStateData, void>({
	query: GET_PLAYER_STATE,
	data: {
		player: playerStateDefaultValue,
	},
})

setInterval(() => {
	try {
		persistVolume(client)
	} catch (err) {
		console.error(err)
	}
}, 1000)

export { client, cache }
