import { loadEnvsFromDotenvFile } from "../../utils/env/load-envs-from-file"
import { NodeEnv } from "../../types/common-types"

export default async () => {
	if (!process.env.IS_CI) {
		loadEnvsFromDotenvFile(NodeEnv.Testing)
	}
}
