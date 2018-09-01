import { ObjectType, Field, Int } from "type-graphql";

@ObjectType({ description: "Object representing a user" })
export class User {
	@Field()
	id: string;
	@Field()
	name: string;
	@Field(type => [String])
	emails: Set<string>;
	@Field(type => String)
	dateAdded: Date;
}