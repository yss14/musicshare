import React, { useCallback } from "react"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Input, Button, Alert, Form } from "antd"
import { useHistory } from "react-router"
import { useFormik } from "formik"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { useLogin } from "@musicshare/react-graphql-client"
import { useConfig } from "../../hooks/use-config"

const StyledSubmitButton = styled(Button)`
	background-color: #e74c3c;
	border-color: white;
	width: 100%;

	&:hover {
		border-color: white;
		background-color: #3498db;
	}
`

const StyledFormItem = styled(Form.Item)`
	& .ant-form-item-explain,
	& .ant-form-item-explain * {
		color: white;
	}
`

interface IFormValues {
	email: string
	password: string
}

const validateForm = ({ email, password }: IFormValues) => {
	const errors: Partial<IFormValues> = {}

	if (email.trim().length < 5) {
		errors.email = "Please enter your email"
	}

	if (password.trim().length < 8) {
		errors.password = "This password seems to be too short"
	}

	return errors
}

interface ILoginFormProps {
	email?: string
}

export const LoginForm: React.FC<ILoginFormProps> = ({ email }) => {
	const history = useHistory()
	const config = useConfig()
	const { mutateAsync: login, error } = useLogin({
		onSuccess: () => history.push("/"),
		onError: console.error,
	})
	const onSubmit = useCallback(
		({ email, password }: IFormValues) => {
			login({ email, password })
		},
		[login],
	)
	const { handleSubmit, touched, values, handleBlur, handleChange, errors, isValid } = useFormik<IFormValues>({
		initialValues: { email: email || "", password: "" },
		validate: validateForm,
		onSubmit: onSubmit,
		initialTouched: { email: email !== undefined },
	})

	return (
		<Form onFinish={() => handleSubmit()} style={{ width: 250 }}>
			{error && <Alert message={error.message.replace("GraphQL error: ", "")} type="error" />}
			<StyledFormItem
				validateStatus={touched.email && errors.email ? "error" : "success"}
				help={touched.email && errors.email && errors.email}
			>
				<Input
					prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					placeholder="E-Mail"
					name="email"
					value={values.email}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</StyledFormItem>
			<StyledFormItem
				validateStatus={touched.password && errors.password ? "error" : "success"}
				help={touched.password && errors.password && errors.password}
			>
				<Input
					prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
					type="password"
					placeholder="Password"
					name="password"
					value={values.password}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</StyledFormItem>
			<Form.Item>
				{config.settings.publicRegistration === true && (
					<Link to="/registration" style={{ color: "white", marginRight: 16 }}>
						Sign Up
					</Link>
				)}
				<Link to="/password/restore" style={{ color: "white" }}>
					Forgot password
				</Link>
			</Form.Item>
			<Form.Item>
				<StyledSubmitButton type="primary" key="submit" htmlType="submit" disabled={!isValid}>
					Sign in
				</StyledSubmitButton>
			</Form.Item>
		</Form>
	)
}
