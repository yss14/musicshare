import { ArgsType, Field, ObjectType } from "type-graphql";
import * as Relay from 'graphql-relay'

@ObjectType()
export class PageInfo implements Relay.PageInfo {
	@Field()
	public readonly hasNextPage!: boolean
	@Field()
	public readonly hasPreviousPage!: boolean
	@Field()
	public readonly startCursor?: string;
	@Field()
	public readonly endCursor?: string;
}

@ArgsType()
export class ConnectionArgs implements Relay.ConnectionArguments {
	@Field({ nullable: true, description: 'Paginate before opaque cursor' })
	public readonly before?: string;
	@Field({ nullable: true, description: 'Paginate after opaque cursor' })
	public readonly after?: string;
	@Field({ nullable: true, description: 'Paginate first' })
	public readonly first?: number
	@Field({ nullable: true, description: 'Paginate last' })
	public readonly last?: number
}

@ArgsType()
export class TimestampArgs {
	@Field()
	public readonly lastTimestamp!: Date;
}
