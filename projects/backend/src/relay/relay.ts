import { ObjectType, Field } from "type-graphql"
import { TypeValue } from "type-graphql/dist/decorators/types"
import { ConnectionCursor } from "graphql-relay"
import * as Relay from 'graphql-relay'
import { PageInfo } from "../args/pagination-args"

export function connectionTypes<T extends TypeValue>(name: string, nodeType: T) {
	@ObjectType(`${name}Edge`)
	class Edge implements Relay.Edge<T> {
		@Field(() => nodeType)
		public readonly node!: T

		@Field({ description: 'Used in `before` and `after` args' })
		public readonly cursor!: ConnectionCursor
	}

	@ObjectType(`${name}Connection`)
	class Connection implements Relay.Connection<T> {
		@Field(() => PageInfo)
		public readonly pageInfo!: PageInfo

		@Field(() => [Edge])
		public readonly edges!: Edge[]
	}

	return {
		Connection,
		Edge,
	}
}
