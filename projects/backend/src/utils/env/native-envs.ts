import { NodeEnv } from "../../types/common-types";

export const isValidNodeEnvironment = (value: string | undefined): value is NodeEnv =>
	value !== undefined && Object.values(NodeEnv).map(v => v.toString().toLowerCase()).includes(value);

export const isProductionEnvironment = () =>
	process.env.NODE_ENV !== NodeEnv.Development && process.env.NODE_ENV !== NodeEnv.Testing;