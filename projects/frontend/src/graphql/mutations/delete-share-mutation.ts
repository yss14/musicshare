import gql from "graphql-tag";
import { useMutation, MutationResult } from "react-apollo";
import { IMutationOptions } from "../hook-types";
import { useCallback } from "react";
import { MutationUpdaterFn } from "apollo-client";
import { IGetSharesData, IGetSharesVariables, GET_SHARES } from "../queries/shares-query";

interface IDeleteShareData {
	deleteShare: boolean;
}

interface IDeleteShareVariables {
	shareID: string;
}

const DELETE_SHARE = gql`
	mutation DeleteShare($shareID: String!) {
		deleteShare(shareID: $shareID)
	}
`

export const useDeleteShare = (opts?: IMutationOptions<IDeleteShareData>) => {
	const makeUpdateSharesCache = useCallback((shareID: string): MutationUpdaterFn<IDeleteShareData> => (cache, { data, }) => {
		if (!data) return

		const currentData = cache.readQuery<IGetSharesData, IGetSharesVariables>({
			query: GET_SHARES,
		})!

		cache.writeQuery<IGetSharesData, IGetSharesVariables>({
			query: GET_SHARES,
			data: {
				viewer: {
					id: currentData.viewer.id,
					__typename: 'User',
					shares: currentData.viewer.shares.filter(share => share.id !== shareID)
				}
			}
		})
	}, [])

	const [deleteShareMutation, other] = useMutation<IDeleteShareData, IDeleteShareVariables>(DELETE_SHARE, opts)

	const deleteShare = useCallback((shareID: string) => {
		deleteShareMutation({
			variables: { shareID },
			update: makeUpdateSharesCache(shareID),
		})
	}, [deleteShareMutation, makeUpdateSharesCache])

	return [deleteShare, other] as [(shareID: string) => void, MutationResult<IDeleteShareData>]
}