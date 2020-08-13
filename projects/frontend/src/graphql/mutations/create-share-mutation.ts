import { IShare, shareKeys } from "../types"
import gql from "graphql-tag"
import { useMutation, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { IGetSharesData, IGetSharesVariables, GET_SHARES } from "../queries/shares-query"

interface ICreateShareVariables {
	name: string
}

interface ICreateShareData {
	createShare: IShare
}

const CREATE_SHARE = gql`
	mutation CreateShare($name: String!) {
		createShare(name: $name) {
			${shareKeys}
		}
	}
`

export const useCreateShare = (opts?: MutationHookOptions<ICreateShareData, ICreateShareVariables>) => {
	const updateSharesCache = useCallback<MutationUpdaterFn<ICreateShareData>>((cache, { data }) => {
		if (!data) return

		const currentData = cache.readQuery<IGetSharesData, IGetSharesVariables>({
			query: GET_SHARES,
		})!

		const { createShare: newShare } = data

		cache.writeQuery<IGetSharesData, IGetSharesVariables>({
			query: GET_SHARES,
			data: {
				viewer: {
					id: currentData.viewer.id,
					__typename: "User",
					shares: currentData.viewer.shares.concat({
						...newShare,
						__typename: "Share",
					}),
				},
			},
		})
	}, [])

	const hook = useMutation<ICreateShareData, ICreateShareVariables>(CREATE_SHARE, {
		update: updateSharesCache,
		...(opts || {}),
	})

	return hook
}
