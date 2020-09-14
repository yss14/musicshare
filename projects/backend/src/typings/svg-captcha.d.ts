declare module "svg-captcha" {
	export interface ICaptcha {
		text: string
		data: string
	}

	export interface ICreateCaptchaOpts {
		size?: number
		noise?: number
	}

	export const create = (opts?: ICreateCaptchaOpts) => ICaptcha
}
