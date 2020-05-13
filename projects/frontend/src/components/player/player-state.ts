import gql from "graphql-tag"
import { IScopedSong, scopedSongKeys } from "../../graphql/types"
import { useQuery, useMutation } from "react-apollo"
import ApolloClient from "apollo-client"
import { ApolloCache } from "apollo-cache"

const VOLUME_PERSIST_KEY = "player.volume"

export const persistVolume = (client: ApolloClient<unknown>) => {
	const currentData = client.readQuery<IGetPlayerSettingsData, void>({
		query: GET_PLAYER_SETTINGS_STATE,
	})

	if (currentData) {
		window.localStorage.setItem(VOLUME_PERSIST_KEY, String(currentData.player.volume))
	}
}

export const getPersistantVolume = () => parseFloat(window.localStorage.getItem(VOLUME_PERSIST_KEY) || "0.8")

export const playerStateTypeDefs = gql`
	type PlayerQueueItem {
		id: String!
		song: ScopedSong!
	}

	type Player {
		currentSong: ScopedSong
		queue: [PlayerQueueItem!]!
		playing: Boolean!
		playbackProgress: Float!
		bufferingProgress: Float!
		volume: Float!
		duration: Int!
		error: String
		isDefaultSongQueue: Boolean!
	}

	extend type Query {
		player: Player!
	}

	extend type Mutation {
		setPlayerQueue(items: [PlayerQueueItem!]!): [PlayerQueueItem!]!
	}
`

const playerPlaybackStateFragment = gql`
	fragment PlayerPlaybackState on Player {
		playing
		playbackProgress
		bufferingProgress
		currentSong {
			${scopedSongKeys}
		}
		duration
		error
	}
`

const playerQueueStateFragment = gql`
	fragment PlayerQueueState on Player {
		queue {
			id
			song {${scopedSongKeys}}
		}
		isDefaultQueue
	}
`

const playerSettingsStateFragment = gql`
	fragment PlayerSettingsState on Player {
		volume
	}
`

const playerStateFragment = gql`
	${playerPlaybackStateFragment}
	${playerQueueStateFragment}
	${playerSettingsStateFragment}

	fragment PlayerState on Player {
		...PlayerPlaybackState
		...PlayerQueueState
		...PlayerSettingsState
	}
`

export interface IPlayerQueueItem {
	__typename: "PlayerQueueItem"
	id: string
	song: IScopedSong
}

export interface IPlayerState {
	__typename: "Player"
	playing: boolean
	playbackProgress: number
	bufferingProgress: number
	volume: number
	currentSong: IScopedSong | null
	duration: number
	error: string | null
	queue: IPlayerQueueItem[]
	isDefaultQueue: boolean
}

export const playerStateDefaultValue: IPlayerState = {
	__typename: "Player",
	playing: false,
	playbackProgress: 0,
	bufferingProgress: 0,
	volume: getPersistantVolume(),
	currentSong: null,
	duration: 0,
	error: null,
	queue: [],
	isDefaultQueue: true,
}

interface IPlayerStateData<F> {
	player: F
}

interface IPlayerPlaybackState {
	playing: boolean
	playbackProgress: number
	bufferingProgress: number
	currentSong: IScopedSong | null
	duration: number
	error: string | null
}

export interface IGetPlayerPlaybackStateData extends IPlayerStateData<IPlayerPlaybackState> {}

export const GET_PLAYER_PLAYBACK_STATE = gql`
	${playerPlaybackStateFragment}

	query PlayerPlaybackState {
		player {
			...PlayerPlaybackState
		}
	}
`

interface IPlayerQueueState {
	queue: IPlayerQueueItem[]
	isDefaultQueue: boolean
}

export interface IGetPlayerQueueStateData extends IPlayerStateData<IPlayerQueueState> {}

export const GET_PLAYER_QUEUE_STATE = gql`
	${playerQueueStateFragment}

	query PlayerQueueState {
		player {
			...PlayerQueueState
		}
	}
`

interface IPlayerSettingsState {
	volume: number
}

export interface IGetPlayerSettingsData extends IPlayerStateData<IPlayerSettingsState> {}

export const GET_PLAYER_SETTINGS_STATE = gql`
	${playerSettingsStateFragment}

	query PlayerSettingsState {
		player {
			...PlayerSettingsState
		}
	}
`

export interface IGetPlayerStateData extends IPlayerStateData<IPlayerState> {}

export const GET_PLAYER_STATE = gql`
	${playerStateFragment}

	query PlayerState {
		player @client {
			...PlayerState
		}
	}
`

export const usePlayerPlaybackState = () => useQuery<IGetPlayerPlaybackStateData, void>(GET_PLAYER_PLAYBACK_STATE)

export const usePlayerQueueState = () => useQuery<IGetPlayerQueueStateData, void>(GET_PLAYER_QUEUE_STATE)

export const usePlayerSettingsState = () => useQuery<IGetPlayerSettingsData, void>(GET_PLAYER_SETTINGS_STATE)

export const usePlayerState = () => useQuery<IGetPlayerStateData, void>(GET_PLAYER_STATE)

export const makeUpdatePlayerState = (client: ApolloClient<unknown>) => (data: Partial<IPlayerState>) => {
	const currentState = client.readQuery<IGetPlayerQueueStateData, void>({
		query: GET_PLAYER_QUEUE_STATE,
	})

	if (!currentState) {
		console.warn("Can't update player queue")

		return
	}

	client.writeData({
		data: {
			__typename: "Query",
			player: { ...currentState.player, ...data, __typename: "Player" },
		},
	})
}

type ISetPlayerQueueData = IPlayerQueueItem[]

interface ISetPlayerQueueVariables {
	items: IPlayerQueueItem[]
}

const SET_PLAYER_QUEUE = gql`
	mutation SetPlayerQueue($items: [PlayerQueueItem!]!) {
		setPlayerQueue(items: $items) @client
	}
`

type ResolverFn<A, R> = (parent: any, args: A, { cache }: { cache: ApolloCache<unknown> }) => R

const setPlayerQueue: ResolverFn<ISetPlayerQueueVariables, ISetPlayerQueueData> = (_, { items }, { cache }) => {
	const currentState = cache.readQuery<IGetPlayerQueueStateData, void>({
		query: GET_PLAYER_QUEUE_STATE,
	})

	if (!currentState) {
		console.warn("Can't update player queue")

		return items
	}
	console.log("items", items)
	cache.writeQuery<IGetPlayerQueueStateData, void>({
		query: GET_PLAYER_QUEUE_STATE,
		data: {
			...currentState,
			player: {
				...currentState.player,
				queue: items,
			},
		},
	})

	return items
}

export const useSetPlayerQueue = () => useMutation<ISetPlayerQueueData, ISetPlayerQueueVariables>(SET_PLAYER_QUEUE)

export const playerStateResolvers = {
	Mutation: {
		setPlayerQueue,
	},
}
