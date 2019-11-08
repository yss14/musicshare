import { ArgsType, Field, ObjectType } from "type-graphql";
import * as Relay from 'graphql-relay'

export type ConnectionCursor = Relay.ConnectionCursor

@ObjectType()
export class PageInfo implements Relay.PageInfo {
	@Field()
	hasNextPage!: boolean
	@Field()
	hasPreviousPage!: boolean
	@Field()
	startCursor?: ConnectionCursor
	@Field()
	endCursor?: ConnectionCursor
}

@ArgsType()
export class ConnectionArgs implements Relay.ConnectionArguments {
	@Field({ nullable: true, description: 'Paginate before opaque cursor' })
	before?: ConnectionCursor
	@Field({ nullable: true, description: 'Paginate after opaque cursor' })
	after?: ConnectionCursor
	@Field({ nullable: true, description: 'Paginate first' })
	first?: number
	@Field({ nullable: true, description: 'Paginate last' })
	last?: number
}
