import { ArgsType, Field } from "type-graphql"
import { IsEmail, Length } from "class-validator"

@ArgsType()
export class RegistrationInput {
	@IsEmail()
	@Field(() => String)
	public readonly email!: string

	@Length(3, 20)
	@Field(() => String)
	public readonly name!: string

	@Length(8, 40)
	@Field(() => String)
	public readonly password!: string

	@Length(36)
	@Field(() => String)
	public readonly captchaID!: string

	@Length(6)
	@Field(() => String)
	public readonly captchaSolution!: string
}
