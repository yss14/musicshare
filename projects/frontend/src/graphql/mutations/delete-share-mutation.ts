import gql from "graphql-tag"
import { useMutation, MutationResult, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { queryCache } from "react-query"
import { getQueryKey, GET_SHARES } from "@musicshare/graphql-client"

interface IDeleteShareData {
	deleteShare: boolean
}

interface IDeleteShareVariables {
	shareID: string
}

const DELETE_SHARE = gql`
	mutation DeleteShare($shareID: String!) {
		deleteShare(shareID: $shareID)
	}
`

export const useDeleteShare = (opts?: MutationHookOptions<IDeleteShareData, IDeleteShareVariables>) => {
	const makeUpdateSharesCache = useCallback(
		(): MutationUpdaterFn<IDeleteShareData> => (cache, { data }) => {
			queryCache.invalidateQueries(getQueryKey(GET_SHARES.query))
		},
		[],
	)

	const [deleteShareMutation, other] = useMutation<IDeleteShareData, IDeleteShareVariables>(DELETE_SHARE, opts)

	const deleteShare = useCallback(
		(shareID: string) => {
			deleteShareMutation({
				variables: { shareID },
				update: makeUpdateSharesCache(),
			})
		},
		[deleteShareMutation, makeUpdateSharesCache],
	)

	return [deleteShare, other] as [(shareID: string) => void, MutationResult<IDeleteShareData>]
}
