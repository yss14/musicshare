import { ObjectType, Field } from "type-graphql"
import { plainToClass } from "class-transformer"

@ObjectType()
export class Captcha {
	@Field()
	public readonly id!: string

	@Field()
	public readonly image!: string

	public static create(id: string, image: string): Captcha {
		return plainToClass(Captcha, {
			id,
			image,
		})
	}
}
