import { Share } from './share.model';
import { ObjectType, Field } from "type-graphql";

@ObjectType({ description: "Object representing a user" })
export class User {
	@Field()
	public readonly id!: string;

	@Field()
	public readonly name!: string;

	@Field(type => [String])
	public readonly emails!: Set<string>;

	@Field(type => [Share])
	public readonly shares!: Share[];
}