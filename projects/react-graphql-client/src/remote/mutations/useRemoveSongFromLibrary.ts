import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryClient,
} from "../../react-query-graphql"
import { GET_MERGED_SONGS } from "../queries/useMergedSongs"
import { GET_SHARES } from "../queries/useShares"
import { GET_SHARE_SONGS } from "../queries/useShareSongs"

export interface IRemoveSongFromLibraryData {
	removeSongFromLibrary: boolean
}

export interface IRemoveSongFromLibraryVariables {
	input: {
		shareID: string
		songID: string
	}
}

export const REMOVE_SONG_FROM_LIBRARY = TransformedGraphQLMutation<
	IRemoveSongFromLibraryData,
	IRemoveSongFromLibraryVariables
>(gql`
	mutation removeSongFromLibrary($input: RemoveSongFromLibraryInput!) {
		removeSongFromLibrary(input: $input)
	}
`)((data) => data.removeSongFromLibrary)

export const useRemoveSongFromLibrary = (opts?: IGraphQLMutationOpts<typeof REMOVE_SONG_FROM_LIBRARY>) => {
	const mutation = useGraphQLMutation(REMOVE_SONG_FROM_LIBRARY, {
		...opts,
		onSuccess: (data, variables, context) => {
			typedQueryClient.setTypedQueryData(
				{
					query: GET_SHARE_SONGS,
					variables: { shareID: variables.input.shareID },
				},
				(currentData) => currentData?.filter((song) => song.id !== variables.input.songID) || [],
			)
			typedQueryClient.setTypedQueryData(
				{
					query: GET_MERGED_SONGS,
				},
				(currentData) => currentData?.filter((song) => song.id !== variables.input.songID) || [],
			)

			const userShares =
				typedQueryClient.getTypedQueryData({
					query: GET_SHARES,
				}) || []

			for (const userShare of userShares) {
				typedQueryClient.setTypedQueryData(
					{
						query: GET_SHARE_SONGS,
						variables: { shareID: userShare.id },
					},
					(currentData) => currentData?.filter((song) => song.id !== variables.input.songID) || [],
				)
			}

			if (opts?.onSuccess) opts.onSuccess(data, variables, context)
		},
	})

	return mutation
}
