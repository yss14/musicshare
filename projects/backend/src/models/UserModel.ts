import { Share } from './ShareModel';
import { ObjectType, Field } from "type-graphql";
import { IUserDBResult } from '../database/schema/tables';
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

	public static fromDBResult(dbResult: IUserDBResult): User {
		return plainToClass(
			User,
			{
				id: dbResult.user_id.toString(),
				name: dbResult.name,
				email: dbResult.email
			}
		);
	}
}