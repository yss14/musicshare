import React, { useCallback } from "react";
import { Form, Icon, Input, Button, Alert } from "antd";
import { useLogin } from "../../graphql/mutations/login-mutation";
import { useHistory } from "react-router";
import { useFormik } from "formik";

interface IFormValues {
	email: string;
	password: string;
}

const validateForm = ({ email, password }: IFormValues) => {
	const errors: Partial<IFormValues> = {}

	if (email.trim().length < 5) {
		errors.email = 'Please enter your email'
	}

	if (password.trim().length < 8) {
		errors.password = 'This password seems to be too short'
	}

	return errors
}

interface ILoginFormProps {
	email?: string;
}

export const LoginForm: React.FC<ILoginFormProps> = ({ email }) => {
	const history = useHistory()
	const [login, { error }] = useLogin({
		onCompleted: () => history.push("/"),
		onError: console.error,
	});
	const onSubmit = useCallback(({ email, password }: IFormValues) => {
		login(email, password)
	}, [login])
	const { handleSubmit, touched, values, handleBlur, handleChange, errors, isValid } = useFormik<IFormValues>({
		initialValues: { email: email || '', password: '' },
		validate: validateForm,
		onSubmit: onSubmit,
		initialTouched: { email: email !== undefined }
	})

	return (
		<Form onSubmit={handleSubmit} style={{ width: 250 }}>
			{error && <Alert message={error.message.replace('GraphQL error: ', '')} type="error" />}
			<Form.Item validateStatus={touched.email && errors.email ? 'error' : 'success'} help={errors.email}>
				<Input
					prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
					placeholder="E-Mail"
					name="email"
					value={values.email}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item validateStatus={touched.password && errors.password ? 'error' : 'success'} help={errors.password}>
				<Input
					prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
					type="password"
					placeholder="Password"
					name="password"
					value={values.password}
					onChange={handleChange}
					onBlur={handleBlur}
				/>
			</Form.Item>
			<Form.Item>
				<Button type="link">
					Forgot password
        		</Button>
			</Form.Item>
			<Form.Item>
				<Button
					style={{ width: "100%" }}
					type="primary"
					key="submit"
					htmlType="submit"
					disabled={!isValid}
				>
					Sign in
        		</Button>
			</Form.Item>
		</Form>
	);
}
