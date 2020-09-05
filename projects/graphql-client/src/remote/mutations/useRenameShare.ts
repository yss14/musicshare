import gql from "graphql-tag"
import { Share, shareKeys } from "@musicshare/shared-types"
import {
	TransformedGraphQLMutation,
	IGraphQLMutationOpts,
	useGraphQLMutation,
	typedQueryCache,
} from "../../react-query-graphql"
import { GET_SHARES } from "../queries/useShares"

interface IRenameShareData {
	renameShare: Share
}

interface IRenameShareVariables {
	name: string
	shareID: string
}

const RENAME_SHARE = TransformedGraphQLMutation<IRenameShareData, IRenameShareVariables>(gql`
	mutation renameShare($name: String! $shareID: String!) {
		renameShare(name: $name shareID: $shareID) {
			${shareKeys}
		}
	}
`)((data) => data.renameShare)

export const useRenameShare = (opts?: IGraphQLMutationOpts<typeof RENAME_SHARE>) => {
	const mutation = useGraphQLMutation(RENAME_SHARE, {
		...opts,
		onSuccess: (data, variables) => {
			typedQueryCache.setTypedQueryData(
				{
					query: GET_SHARES,
				},
				(currentData) => currentData?.map((share) => (share.id === data.id ? data : share)) || [],
			)

			if (opts?.onSuccess) opts.onSuccess(data, variables)
		},
	})

	return mutation
}
