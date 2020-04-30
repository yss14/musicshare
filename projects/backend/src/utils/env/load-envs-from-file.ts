import { NodeEnv } from "../../types/common-types"
import * as dotenv from "dotenv"
import * as fs from "fs"

/* istanbul ignore next */
export const loadEnvsFromDotenvFile = (environment: NodeEnv) => {
	const path = `./${environment}.env`

	if (fs.existsSync(path)) {
		dotenv.config({
			path: `./${environment}.env`,
		})
	} else {
		console.info(`Dotenv ${path} not found, taking environment variables which are passed to this node process`)
	}
}
