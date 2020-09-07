import gql from "graphql-tag"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_SHARE_SONGS } from "../queries/useShareSongs"

interface IRemoveSongFromLibraryData {
	removeSongFromLibrary: boolean
}

interface IRemoveSongFromLibraryVariables {
	input: {
		shareID: string
		songID: string
	}
}

const REMOVE_SONG_FROM_LIBRARY = TransformedGraphQLMutation<
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
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_SHARE_SONGS,
					variables: { shareID: variables.input.shareID },
				},
				(currentData) => currentData?.filter((song) => song.id !== variables.input.songID) || [],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
