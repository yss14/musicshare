import { ObjectType, Field } from "type-graphql";
import { plainToClass } from "class-transformer";

@ObjectType({ description: 'This represents an auth token bundle received during the login process' })
export class AuthTokenBundle {
	@Field()
	public readonly authToken!: string;

	@Field()
	public readonly refreshToken!: string;

	public static create(refreshToken: string, authToken: string): AuthTokenBundle {
		return plainToClass(
			AuthTokenBundle,
			{
				refreshToken,
				authToken,
			}
		);
	}
}