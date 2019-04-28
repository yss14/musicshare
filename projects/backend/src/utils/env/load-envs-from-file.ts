import { NodeEnv } from "../../types/common-types";
import * as dotenv from 'dotenv';

/* istanbul ignore next */
export const loadEnvsFromDotenvFile = (environment: NodeEnv) => {
	console.log(dotenv)
	dotenv.config({
		path: `./${environment}.env`
	});

	console.log(process.env.AZURE_STORAGE_CONNECTION_STRING);
}