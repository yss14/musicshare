import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { SongType, songTypeKeys } from "@musicshare/shared-types"
import { GET_SONGTYPES } from "../queries/useSongTypes"

export interface IAddSongTypeData {
	addSongType: SongType
}

export interface IAddSongTypeVariables {
	name: string
	group: string
	alternativeNames: string[]
	hasArtists: boolean
}

export const ADD_SONG_TYPE = TransformedGraphQLMutation<IAddSongTypeData, IAddSongTypeVariables>(gql`
	mutation addSongType($name: String! $group: String! $alternativeNames: [String!]! $hasArtists: Boolean!) {
		addSongType(name: $name group: $group alternativeNames: $alternativeNames hasArtists: $hasArtists){
			${songTypeKeys}
		}
	}
`)((data) => data.addSongType)

export const useAddSongType = (opts?: IGraphQLMutationOpts<typeof ADD_SONG_TYPE>) => {
	const mutation = useGraphQLMutation(ADD_SONG_TYPE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_SONGTYPES,
				},
				(currentData) => [...(currentData || []), data],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
