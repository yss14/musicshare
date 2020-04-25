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
		console.warn(`Dotenv ${path} not found, environment variables might be empty`)
	}
}
