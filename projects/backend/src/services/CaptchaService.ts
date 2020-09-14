import { IDatabaseClient } from "postgres-schema-builder"
import * as svgCaptcha from "svg-captcha"
import { v4 as uuid } from "uuid"
import { CaptchaTable } from "../database/tables"
import { Captcha } from "../models/CaptchaModel"

interface ICaptchaServiceArgs {
	database: IDatabaseClient
}

export type ICaptchaService = ReturnType<typeof CaptchaService>

export const CaptchaService = ({ database }: ICaptchaServiceArgs) => {
	const createCaptcha = async () => {
		const generatedCaptcha = svgCaptcha.create({
			size: 6,
			noise: 2,
		})

		const captchaID = await insertCaptcha(generatedCaptcha.text)

		return Captcha.create(captchaID, generatedCaptcha.data)
	}

	const insertCaptcha = async (solution: string) => {
		const id = uuid()

		await database.query(CaptchaTable.insertFromObj({ captcha_id: id, solution, date_added: new Date() }))

		return id
	}

	const checkCaptcha = async (captchaID: string, solution: string) => {
		const result = await database.query(CaptchaTable.select("*", ["captcha_id"])([captchaID]))

		if (!result || result.length !== 1 || result[0].date_removed !== null) {
			throw new Error("Invalid Captcha")
		}

		return result[0].solution === solution
	}

	const invalidateCaptcha = async (captchaID: string) => {
		await database.query(CaptchaTable.update(["date_removed"], ["captcha_id"])([new Date()], [captchaID]))
	}

	return {
		createCaptcha,
		checkCaptcha,
		invalidateCaptcha,
	}
}
