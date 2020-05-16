import React, { useCallback } from "react"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Input, Button, Alert, Form } from "antd"
import { useLogin } from "../../graphql/mutations/login-mutation"
import { useHistory } from "react-router"
import { useFormik } from "formik"
import { Link } from "react-router-dom"
import styled from "styled-components"

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
	& .ant-form-explain {
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
	const [login, { error }] = useLogin({
		onCompleted: () => history.push("/"),
		onError: console.error,
	})
	const onSubmit = useCallback(
		({ email, password }: IFormValues) => {
			login(email, password)
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
			<StyledFormItem validateStatus={touched.email && errors.email ? "error" : "success"} help={errors.email}>
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
				help={errors.password}
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
				<Link to="/password/restore" style={{ color: "#e74c3c" }}>
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
