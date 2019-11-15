import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import { IMutationOptions } from "../hook-types";
import { IShare, shareKeys } from "../types";

interface IRenameShareData {
	renameShare: IShare;
}

interface IRenameShareVariables {
	name: string;
	shareID: string;
}

const RENAME_SHARE = gql`
	mutation RenameShare($name: String! $shareID: String!) {
		renameShare(name: $name shareID: $shareID) {
			${shareKeys}
		}
	}
`

export const useRenameShare = (opts?: IMutationOptions<IRenameShareData>) => {
	const hook = useMutation<IRenameShareData, IRenameShareVariables>(RENAME_SHARE, opts)

	return hook
}
