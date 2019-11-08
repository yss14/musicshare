import { ObjectType, Field } from "type-graphql"
import { TypeValue } from "type-graphql/dist/decorators/types"
import { ConnectionCursor } from "graphql-relay"
import * as Relay from 'graphql-relay'
import { PageInfo } from "../args/pagination-args"


export function connectionTypes<T extends TypeValue>(name: string, nodeType: T) {
	@ObjectType(`${name}Edge`)
	class Edge implements Relay.Edge<T> {
		@Field(() => nodeType)
		node!: T

		@Field({ description: 'Used in `before` and `after` args' })
		cursor!: ConnectionCursor
	}

	@ObjectType(`${name}Connection`)
	class Connection implements Relay.Connection<T> {
		@Field(() => PageInfo)
		pageInfo!: PageInfo

		@Field(() => [Edge])
		edges!: Edge[]
	}
	return {
		Connection,
		Edge,
	}
}
