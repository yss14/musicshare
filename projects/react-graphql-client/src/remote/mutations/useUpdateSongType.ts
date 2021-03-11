import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import { SongType, songTypeKeys } from "@musicshare/shared-types"
import { GET_SONGTYPES } from "../queries/useSongTypes"

export interface IUpdateSongTypeData {
	updateSongType: SongType
}

export interface IUpdateSongTypeVariables {
	songTypeID: string
	name: string
	group: string
	alternativeNames: string[]
	hasArtists: boolean
}

export const UPDATE_SONG_TYPE = TransformedGraphQLMutation<IUpdateSongTypeData, IUpdateSongTypeVariables>(gql`
	mutation updateSongType($songTypeID: String! $genreID: String! $name: String! $group: String! $alternativeNames: [String!]! $hasArtists: Boolean!) {
		updateSongType(songTypeID: $songTypeID genreID: $genreID name: $name group: $group alternativeNames: $alternativeNames hasArtists: $hasArtists){
			${songTypeKeys}
		}
	}
`)((data) => data.updateSongType)

export const useUpdateSongType = (opts?: IGraphQLMutationOpts<typeof UPDATE_SONG_TYPE>) => {
	const mutation = useGraphQLMutation(UPDATE_SONG_TYPE, {
		...opts,
		onSuccess: (data, variables, context) => {
			typedQueryClient.setTypedQueryData(
				{
					query: GET_SONGTYPES,
				},
				(currentData) => (currentData || []).map((songType) => (songType.id === data.id ? data : songType)),
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables, context)
		},
	})

	return mutation
}
