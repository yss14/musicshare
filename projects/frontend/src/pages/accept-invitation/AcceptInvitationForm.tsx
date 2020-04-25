import React, { useCallback } from "react"
import { Form, Icon, Input, Button, Alert } from "antd"
import { IInvitationPayload } from "@musicshare/shared-types"
import { useFormik } from "formik"
import { useAcceptInvitation } from "../../graphql/mutations/accept-invitation-mutation"
import { Link } from "react-router-dom"

interface IFormValues {
	username: string
	password: string
	passwordRepitition: string
}

const initialFormValues: IFormValues = {
	username: "",
	password: "",
	passwordRepitition: "",
}

const validateForm = ({ password, passwordRepitition, username }: IFormValues) => {
	const errors: Partial<IFormValues> = {}

	if (username.trim().length < 4) {
		errors.username = "Username must be at least 4 characters long"
	}

	if (password.trim().length < 8) {
		errors.password = "Password must be at least 8 characters long"
	}

	if (password !== passwordRepitition) {
		errors.passwordRepitition = "Passwords must match"
	}

	return errors
}

interface IAcceptInvitationFormProps {
	invitationPayload: IInvitationPayload
	invitationToken: string
}

export const AcceptInvitationForm: React.FC<IAcceptInvitationFormProps> = ({ invitationPayload, invitationToken }) => {
	const [acceptInvitation, { error, data }] = useAcceptInvitation({
		onError: console.error,
		onCompleted: () => resetForm(),
	})
	const onSubmit = useCallback(
		({ username, password }: IFormValues) => {
			acceptInvitation({
				name: username,
				password,
				invitationToken,
			})
		},
		[acceptInvitation, invitationToken],
	)
	const { handleSubmit, errors, values, handleChange, isValid, handleBlur, touched, resetForm, dirty } = useFormik({
		initialValues: initialFormValues,
		onSubmit,
		validate: validateForm,
	})

	const successAlert = data && (
		<Alert
			message={
				<>
					<p>
						Your account has been created. Please note the following token and keep it safe! In case you
						have to restore your password, you need this token!
					</p>
					<p>Your restore token: {data.acceptInvitation.restoreToken}</p>
					<p>
						Proceed to <Link to={`/login/${invitationPayload.email}`}>Sign In</Link>
					</p>
				</>
			}
			type="success"
		/>
	)
	const errorAlert = error && <Alert message="Invitation expired" type="error" />

	return (
		<Form onSubmit={handleSubmit} style={{ width: 250 }}>
			{errorAlert}
			{successAlert}
			<Form.Item>
				<Input
					prefix={<Icon type="email" style={{ color: "rgba(0,0,0,.25)" }} />}
					type="email"
					name="email"
					value={invitationPayload.email}
					disabled
				/>
			</Form.Item>
			<Form.Item
				validateStatus={touched.username && errors.username ? "error" : "success"}
				help={errors.username}
			>
				<Input
					prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
					placeholder="Username"
					type="text"
					name="username"
					value={values.username}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item
				validateStatus={touched.password && errors.password ? "error" : "success"}
				help={errors.password}
			>
				<Input
					prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
					placeholder="Password"
					type="password"
					name="password"
					value={values.password}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item
				validateStatus={touched.passwordRepitition && errors.passwordRepitition ? "error" : "success"}
				help={errors.passwordRepitition}
			>
				<Input
					prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
					placeholder="Repeat Password"
					type="password"
					name="passwordRepitition"
					value={values.passwordRepitition}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item>
				<Button
					style={{ width: "100%" }}
					type="primary"
					key="submit"
					htmlType="submit"
					disabled={!(isValid && dirty)}
				>
					Create
				</Button>
			</Form.Item>
		</Form>
	)
}
