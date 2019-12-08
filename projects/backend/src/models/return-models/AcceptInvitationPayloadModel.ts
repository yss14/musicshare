import { ObjectType, Field } from "type-graphql";
import { User } from "../UserModel";

@ObjectType()
export class AcceptInviationPayload {
	@Field()
	public readonly restoreToken!: string;

	@Field(() => User)
	public readonly user!: User;
}
