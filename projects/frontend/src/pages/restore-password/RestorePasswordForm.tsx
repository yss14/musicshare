import React, { useCallback, useState } from "react";
import * as validator from 'validator'
import { useFormik, } from "formik";
import { Input, Icon, Form, Button, Alert } from "antd";
import { Link } from "react-router-dom";
import { useRestorePassword } from "../../graphql/mutations/restore-password-mutation";

interface IFormValues {
	email: string;
	restoreToken: string;
	newPassword: string;
}

const initialFormValues: IFormValues = {
	email: '',
	restoreToken: '',
	newPassword: '',
}

const validateForm = ({ email, restoreToken, newPassword }: IFormValues) => {
	const errors: Partial<IFormValues> = {}

	if (!validator.isEmail(email)) {
		errors.email = 'Not a valid email address'
	}

	if (restoreToken.trim().length !== 32) {
		errors.restoreToken = 'Restore token must be of length 32 characters'
	}

	if (newPassword.length < 8) {
		errors.newPassword = 'Password must be at least 8 characters long'
	}

	return errors
}

export const RestorePasswordForm: React.FC = () => {
	const [email, setEMail] = useState("")
	const [restorePassword, { error, data }] = useRestorePassword({
		onError: console.error,
		onCompleted: () => resetForm(),
	})
	const onSubmit = useCallback((values: IFormValues) => {
		restorePassword(values)
		setEMail(values.email)
	}, [restorePassword])
	const { handleSubmit, errors, values, handleChange, isValid, handleBlur, touched, resetForm } = useFormik({
		initialValues: initialFormValues,
		onSubmit,
		validate: validateForm,
		isInitialValid: false,
	})

	const successAlert = data && (
		<Alert
			message={
				<>
					<p>Your password has been restored. We issued a new restore token, which you can use the next time to restore your password.
						Please again note the token and keep it safe!</p>
					<p>Your new restore token: {data.restorePassword}</p>
					<p>
						Proceed to <Link to={`/login/${email}`}>Sign In</Link>
					</p>
				</>
			}
			type="success"
		/>
	)
	const errorAlert = error && <Alert message={error.message.replace('GraphQL error: ', '')} type="error" />

	return (
		<Form onSubmit={handleSubmit} style={{ width: 250 }}>
			{errorAlert}
			{successAlert}
			<Form.Item
				validateStatus={touched.email && errors.email ? 'error' : 'success'}
				help={errors.email}
			>
				<Input
					prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
					type="email"
					name="email"
					placeholder="E-Mail"
					value={values.email}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item
				validateStatus={touched.restoreToken && errors.restoreToken ? 'error' : 'success'}
				help={errors.restoreToken}
			>
				<Input
					prefix={<Icon type="idcard" style={{ color: "rgba(0,0,0,.25)" }} />}
					type="text"
					name="restoreToken"
					placeholder="Restore Token"
					value={values.restoreToken}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item
				validateStatus={touched.newPassword && errors.newPassword ? 'error' : 'success'}
				help={errors.newPassword}
			>
				<Input
					prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
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
					disabled={!isValid}
				>
					Restore Password
        		</Button>
			</Form.Item>
			<Form.Item>
				<Link to="/login">
					To Sign In
        		</Link>
			</Form.Item>
		</Form>
	)
}