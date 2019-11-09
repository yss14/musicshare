import { ArgsType, Field, ObjectType } from "type-graphql";
import * as Relay from 'graphql-relay'

export type ConnectionCursor = Relay.ConnectionCursor

@ObjectType()
export class PageInfo implements Relay.PageInfo {
	@Field()
	public readonly hasNextPage!: boolean
	@Field()
	public readonly hasPreviousPage!: boolean
	@Field()
	public readonly startCursor?: ConnectionCursor
	@Field()
	public readonly endCursor?: ConnectionCursor
}

@ArgsType()
export class ConnectionArgs implements Relay.ConnectionArguments {
	@Field({ nullable: true, description: 'Paginate before opaque cursor' })
	public readonly before?: ConnectionCursor
	@Field({ nullable: true, description: 'Paginate after opaque cursor' })
	public readonly after?: ConnectionCursor
	@Field({ nullable: true, description: 'Paginate first' })
	public readonly first?: number
	@Field({ nullable: true, description: 'Paginate last' })
	public readonly last?: number
}
