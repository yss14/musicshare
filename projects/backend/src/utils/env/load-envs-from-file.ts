import { NodeEnv } from "../../types/common-types";
import * as dotenv from 'dotenv';

/* istanbul ignore next */
export const loadEnvsFromDotenvFile = (environment: NodeEnv) => {
	dotenv.load({
		path: `./${environment}.env`
	});
}