import { NodeEnv } from "../../types/common-types";
import * as dotenv from 'dotenv';

export const loadEnvsFromDotenvFile = (environment: NodeEnv) => {
	dotenv.load({
		path: `./${environment}.env`
	});
}