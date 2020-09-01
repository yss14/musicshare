import { IShare, shareKeys } from "../types"
import gql from "graphql-tag"
import { useMutation, MutationHookOptions, MutationUpdaterFn } from "@apollo/client"
import { useCallback } from "react"
import { queryCache } from "react-query"
import { getQueryKey, GET_SHARES } from "@musicshare/graphql-client"

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
		queryCache.invalidateQueries(getQueryKey(GET_SHARES.query))
	}, [])

	const hook = useMutation<ICreateShareData, ICreateShareVariables>(CREATE_SHARE, {
		update: updateSharesCache,
		...(opts || {}),
	})

	return hook
}
