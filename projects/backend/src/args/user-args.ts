import { ArgsType, Field, InputType } from "type-graphql";
import { Length, IsIn } from "class-validator";
import { Permission, Permissions } from "../auth/permissions";

@ArgsType()
export class UserIDArg {
	@Length(36, 36)
	@Field(() => String)
	public readonly userID!: string;
}

@ArgsType()
export class PermissionsArg {
	@IsIn(Permissions.ALL, { each: true })
	@Field(() => [String])
	public readonly permissions!: Permission[];
}

@InputType()
export class UserIDInput {
	@Length(36, 36)
	@Field(() => String)
	public readonly userID!: string;
}
