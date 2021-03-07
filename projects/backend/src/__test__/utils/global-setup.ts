import { loadEnvsFromDotenvFile } from "../../utils/env/load-envs-from-file"
import { NodeEnv } from "../../types/common-types"
import * as fs from "fs"

export default async () => {
	if (fs.existsSync(`${NodeEnv.Testing}.env`)) {
		loadEnvsFromDotenvFile(NodeEnv.Testing)
	}
}
