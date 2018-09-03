import { Share } from './share.model';
import { ObjectType, Field, Int, Float } from "type-graphql";

@ObjectType({ description: "Object representing a user" })
export class User {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field(type => [String])
	emails: Set<string>;

	@Field(type => [Share])
	shares: Share[];
}