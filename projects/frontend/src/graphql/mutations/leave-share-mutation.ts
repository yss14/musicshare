import gql from "graphql-tag"
import { useCallback } from "react"
import { MutationUpdaterFn } from "@apollo/client"
import { IGetSharesData, IGetSharesVariables, GET_SHARES } from "../queries/shares-query"
import { useMutation, MutationResult, MutationHookOptions } from "@apollo/client"

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
		(shareID: string): MutationUpdaterFn<ILeaveShareData> => (cache, { data }) => {
			if (!data) return

			const currentData = cache.readQuery<IGetSharesData, IGetSharesVariables>({
				query: GET_SHARES,
			})!

			cache.writeQuery<IGetSharesData, IGetSharesVariables>({
				query: GET_SHARES,
				data: {
					viewer: {
						id: currentData.viewer.id,
						__typename: "User",
						shares: currentData.viewer.shares.filter((share) => share.id !== shareID),
					},
				},
			})
		},
		[],
	)

	const [leaveShareMutation, other] = useMutation<ILeaveShareData, ILeaveShareVariables>(LEAVE_SHARE, opts)

	const leaveShare = useCallback(
		(shareID: string) => {
			leaveShareMutation({
				variables: { input: { shareID } },
				update: makeUpdateSharesCache(shareID),
			})
		},
		[leaveShareMutation, makeUpdateSharesCache],
	)

	return [leaveShare, other] as [(shareID: string) => void, MutationResult<ILeaveShareData>]
}
