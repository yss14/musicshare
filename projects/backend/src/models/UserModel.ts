import { Share } from './ShareModel';
import { ObjectType, Field } from "type-graphql";
import { IUsersDBResult } from '../database/schema/tables';
import { plainToClass } from 'class-transformer';

@ObjectType({ description: "Object representing a user" })
export class User {
	@Field()
	public readonly id!: string;

	@Field()
	public readonly name!: string;

	@Field()
	public readonly email!: string;

	@Field(type => [Share])
	public readonly shares!: Share[];

	public static fromDBResult(dbResult: IUsersDBResult): User {
		return plainToClass(
			User,
			{
				id: dbResult.id.toString(),
				name: dbResult.name,
				emails: dbResult.email
			}
		);
	}
}