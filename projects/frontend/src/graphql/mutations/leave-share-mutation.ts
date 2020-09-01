import gql from "graphql-tag"
import { useCallback } from "react"
import { useMutation, MutationResult, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { queryCache } from "react-query"
import { getQueryKey, GET_SHARES } from "@musicshare/graphql-client"

interface ILeaveShareData {
	leaveShare: boolean
}

interface ILeaveShareVariables {
	input: {
		shareID: string
	}
}

const LEAVE_SHARE = gql`
	mutation LeaveShare($input: ShareIDInput!) {
		leaveShare(input: $input)
	}
`

export const useLeaveShare = (opts?: MutationHookOptions<ILeaveShareData, ILeaveShareVariables>) => {
	const makeUpdateSharesCache = useCallback(
		(): MutationUpdaterFn<ILeaveShareData> => (cache, { data }) => {
			queryCache.invalidateQueries(getQueryKey(GET_SHARES.query))
		},
		[],
	)

	const [leaveShareMutation, other] = useMutation<ILeaveShareData, ILeaveShareVariables>(LEAVE_SHARE, opts)

	const leaveShare = useCallback(
		(shareID: string) => {
			leaveShareMutation({
				variables: { input: { shareID } },
				update: makeUpdateSharesCache(),
			})
		},
		[leaveShareMutation, makeUpdateSharesCache],
	)

	return [leaveShare, other] as [(shareID: string) => void, MutationResult<ILeaveShareData>]
}
