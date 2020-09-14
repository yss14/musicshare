import { ObjectType, Field } from "type-graphql"
import { Viewer } from "../UserModel"

@ObjectType()
export class RegistrationSuccess {
	@Field()
	public readonly restoreToken!: string

	@Field(() => Viewer)
	public readonly user!: Viewer
}
