import React, { useCallback, useRef } from "react"
import validator from "validator"
import { Formik, FormikHelpers } from "formik"
import { LockOutlined, UserOutlined, MailOutlined, SolutionOutlined } from "@ant-design/icons"
import { Button, Alert, message, Form, Spin } from "antd"
import { Link } from "react-router-dom"
import { useRegister, useCaptcha } from "@musicshare/react-graphql-client"
import { FormElements } from "../../components/common/FormElements"

interface IFormValues {
	name: string
	email: string
	password: string
	captchaSolution: string
}

const initialFormValues: IFormValues = {
	name: "",
	email: "",
	password: "",
	captchaSolution: "",
}

const validateForm = ({ name, email, password, captchaSolution }: IFormValues) => {
	const errors: Partial<IFormValues> = {}

	if (name.trim().length < 2) {
		errors.name = "Too short"
	}

	if (!validator.isEmail(email)) {
		errors.email = "Not a valid email address"
	}

	if (password.trim().length < 8) {
		errors.password = "Password must be at least 8 characters long"
	}

	if (captchaSolution.trim().length !== 6) {
		errors.captchaSolution = "Please revise"
	}

	return errors
}

export const RegistrationForm = () => {
	const formikHelpers = useRef<FormikHelpers<IFormValues>>()
	const { data: captcha, isLoading: isLoadingCaptcha, refetch: resetCaptcha } = useCaptcha()
	const captchaID = captcha?.id
	const [register, { error, data, isLoading }] = useRegister({
		onSuccess: () => {
			message.success(`Registration was successful`)
			formikHelpers.current?.resetForm()
		},
	})
	const onSubmit = useCallback(
		async (values: IFormValues, helpers: FormikHelpers<IFormValues>) => {
			if (captchaID) {
				formikHelpers.current = helpers
				await register({ ...values, captchaID })
				resetCaptcha()
				helpers.setFieldValue("captchaSolution", "")
				helpers.setFieldError("captchaSolution", "Please retry")
			}
		},
		[register, captchaID, resetCaptcha],
	)

	const successAlert = data && (
		<Alert
			message={
				<>
					<p>
						Your account has been created. Please note the following token and keep it safe! In case you
						have to restore your password, you need this token!
					</p>
					<p>Your restore token: {data.restoreToken}</p>
					<p>
						Proceed to <Link to={`/login/${data.user.email}`}>Sign In</Link>
					</p>
				</>
			}
			type="success"
		/>
	)
	const errorAlert = error && <Alert message={error.message.replace("GraphQL error: ", "")} type="error" />

	return (
		<Formik initialValues={initialFormValues} onSubmit={onSubmit} validate={validateForm}>
			{({ handleSubmit, isValid, dirty }) => (
				<Form onFinish={() => handleSubmit()} style={{ width: 250 }}>
					{errorAlert}
					{successAlert}
					<FormElements.Input
						name="name"
						placeholder="Username"
						prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					/>
					<FormElements.Input
						name="email"
						placeholder="E-Mail"
						type="email"
						prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					/>
					<FormElements.Input
						name="password"
						placeholder="Password"
						type="password"
						prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					/>
					<Form.Item>
						{captcha && (
							<img
								src={`data:image/svg+xml;utf8,${encodeURIComponent(captcha.image)}`}
								alt="Captcha"
								style={{ marginBottom: 8 }}
							/>
						)}
						{isLoadingCaptcha && <Spin />}

						<FormElements.Input
							name="captchaSolution"
							placeholder="Captcha Solution"
							prefix={<SolutionOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
						/>
					</Form.Item>

					<Form.Item>
						<Button
							style={{ width: "100%" }}
							type="primary"
							key="submit"
							htmlType="submit"
							disabled={!(isValid && dirty)}
							loading={isLoading}
						>
							Sign Up
						</Button>
					</Form.Item>
					<Form.Item>
						<Link to="/login">To Sign In</Link>
					</Form.Item>
				</Form>
			)}
		</Formik>
	)
}
