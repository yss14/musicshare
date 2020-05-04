import { MiddlewareFn } from "type-graphql"
import { IGraphQLContext } from "../types/context"
import { v4 as uuid } from "uuid"
import { SQLError } from "postgres-schema-builder"

export const SQLErrorInterceptor: MiddlewareFn<IGraphQLContext> = async ({ context, info }, next) => {
	try {
		return await next()
	} catch (err) {
		if (err instanceof SQLError || err.name === "SQLError") {
			const errorID = uuid()
			console.error(`SQLError with id ${errorID}: `, err)

			throw new Error(`Database error with id ${errorID}`)
		}

		throw err
	}
}
