import { loadEnvsFromDotenvFile } from "../../utils/env/load-envs-from-file";
import { NodeEnv } from "../../types/common-types";

export default async () => {
	loadEnvsFromDotenvFile(NodeEnv.Testing);
}