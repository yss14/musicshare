import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { queryCache } from "react-query"
import { getQueryKey, GET_SHARE_SONGS } from "@musicshare/graphql-client"

interface IRemoveSongFromLibraryData {
	removeSongFromLibrary: boolean
}

interface IRemoveSongFromLibraryVariables {
	input: {
		shareID: string
		songID: string
	}
}

const REMOVE_SONG_FROM_LIBRARY = gql`
	mutation RemoveSongFromLibrary($input: RemoveSongFromLibraryInput!) {
		removeSongFromLibrary(input: $input)
	}
`

export const useRemoveSongFromLibrary = (
	opts?: MutationHookOptions<IRemoveSongFromLibraryData, IRemoveSongFromLibraryVariables>,
) => {
	const [removeSongFromLibraryMutation, other] = useMutation<
		IRemoveSongFromLibraryData,
		IRemoveSongFromLibraryVariables
	>(REMOVE_SONG_FROM_LIBRARY, opts)

	const makeUpdateCache = useCallback(
		(shareID: string, songID: string): MutationUpdaterFn<IRemoveSongFromLibraryData> => (cache, { data }) => {
			queryCache.invalidateQueries([getQueryKey(GET_SHARE_SONGS), { shareID }])
		},
		[],
	)

	const removeSongFromLibrary = useCallback(
		async (libraryID: string, songID: string) => {
			await removeSongFromLibraryMutation({
				variables: {
					input: {
						shareID: libraryID,
						songID,
					},
				},
				update: makeUpdateCache(libraryID, songID),
			})
		},
		[removeSongFromLibraryMutation, makeUpdateCache],
	)

	return [removeSongFromLibrary, other] as [
		(libraryID: string, songID: string) => Promise<void>,
		MutationResult<IRemoveSongFromLibraryData>,
	]
}
