import React, { useCallback, useState } from "react"
import validator from "validator"
import { useFormik } from "formik"
import { IdcardOutlined, LockOutlined, UserOutlined } from "@ant-design/icons"
import { Form } from "@ant-design/compatible"
import "@ant-design/compatible/assets/index.css"
import { Input, Button, Alert, message } from "antd"
import { Link } from "react-router-dom"
import { useRestorePassword } from "../../graphql/mutations/restore-password-mutation"

interface IFormValues {
	email: string
	restoreToken: string
	newPassword: string
}

const initialFormValues: IFormValues = {
	email: "",
	restoreToken: "",
	newPassword: "",
}

const validateForm = ({ email, restoreToken, newPassword }: IFormValues) => {
	const errors: Partial<IFormValues> = {}

	if (!validator.isEmail(email)) {
		errors.email = "Not a valid email address"
	}

	if (restoreToken.trim().length !== 32) {
		errors.restoreToken = "Restore token must be of length 32 characters"
	}

	if (newPassword.length < 8) {
		errors.newPassword = "Password must be at least 8 characters long"
	}

	return errors
}

export const RestorePasswordForm: React.FC = () => {
	const [email, setEMail] = useState("")
	const [restorePassword, { error, data }] = useRestorePassword({
		onError: console.error,
		onCompleted: () => {
			resetForm()
			message.success(`Password has been restored successfully`)
		},
	})
	const onSubmit = useCallback(
		(values: IFormValues) => {
			restorePassword(values)
			setEMail(values.email)
		},
		[restorePassword],
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
						Your password has been restored. We issued a new restore token, which you can use the next time
						to restore your password. Please again note the token and keep it safe!
					</p>
					<p>Your new restore token: {data.restorePassword}</p>
					<p>
						Proceed to <Link to={`/login/${email}`}>Sign In</Link>
					</p>
				</>
			}
			type="success"
		/>
	)
	const errorAlert = error && <Alert message={error.message.replace("GraphQL error: ", "")} type="error" />

	return (
		<Form onSubmit={handleSubmit} style={{ width: 250 }}>
			{errorAlert}
			{successAlert}
			<Form.Item validateStatus={touched.email && errors.email ? "error" : "success"} help={errors.email}>
				<Input
					prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					type="email"
					name="email"
					placeholder="E-Mail"
					value={values.email}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item
				validateStatus={touched.restoreToken && errors.restoreToken ? "error" : "success"}
				help={errors.restoreToken}
			>
				<Input
					prefix={<IdcardOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					type="text"
					name="restoreToken"
					placeholder="Restore Token"
					value={values.restoreToken}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item
				validateStatus={touched.newPassword && errors.newPassword ? "error" : "success"}
				help={errors.newPassword}
			>
				<Input
					prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					type="password"
					name="newPassword"
					placeholder="New Password"
					value={values.newPassword}
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
					Restore Password
				</Button>
			</Form.Item>
			<Form.Item>
				<Link to="/login">To Sign In</Link>
			</Form.Item>
		</Form>
	)
}
