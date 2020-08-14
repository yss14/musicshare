import gql from "graphql-tag"
import { useMutation, MutationHookOptions } from "@apollo/client"
import { IShare, shareKeys } from "../types"

interface IRenameShareData {
	renameShare: IShare
}

interface IRenameShareVariables {
	name: string
	shareID: string
}

const RENAME_SHARE = gql`
	mutation RenameShare($name: String! $shareID: String!) {
		renameShare(name: $name shareID: $shareID) {
			${shareKeys}
		}
	}
`

export const useRenameShare = (opts?: MutationHookOptions<IRenameShareData, IRenameShareVariables>) => {
	const hook = useMutation<IRenameShareData, IRenameShareVariables>(RENAME_SHARE, opts)

	return hook
}
