import { TypeValue } from "type-graphql/dist/decorators/types"
import { ObjectType, Field } from "type-graphql"
import { ITimestamped, ITimedstampedResult, ITimedstampedResults } from '@musicshare/shared-types'

@ObjectType({ isAbstract: true })
class Timestamped implements ITimestamped {
	@Field()
	public readonly timestamp!: Date;
}

export const TimestampedResult = <T extends TypeValue>(nodeType: T) => {
	@ObjectType(`TimestampedResult`)
	class TimestampedResultClass extends Timestamped implements ITimedstampedResult<T>{
		@Field(() => nodeType)
		public readonly node!: T
	}

	return TimestampedResultClass
}

export const TimestampedResults = <T extends TypeValue>(nodeType: T) => {
	@ObjectType(`TimestampedResult`)
	class TimestampedResultClass extends Timestamped implements ITimedstampedResults<T>{
		@Field(() => [nodeType])
		public readonly nodes!: T[]
	}

	return TimestampedResultClass
}
