import { Resolver, Query } from "type-graphql"
import { IServices } from "../services/services"
import { Captcha } from "../models/CaptchaModel"

@Resolver(() => Captcha)
export class CaptchaResolver {
	constructor(private readonly services: IServices) {}

	@Query(() => Captcha)
	public async captcha(): Promise<Captcha> {
		return this.services.captchaService.createCaptcha()
	}
}
