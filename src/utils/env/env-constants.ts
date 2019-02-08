import { NodeEnv } from "../../types/common-types";

export const __TESTING__ = process.env.NODE_ENV === NodeEnv.Testing;