import React from "react";
import { Form, Icon, Input, Button, Checkbox } from "antd";
import { FormComponentProps } from "antd/lib/form";
import { useLogin } from "../../graphql/mutations/login-mutation";
import { withRouter, RouteComponentProps } from "react-router";

const LoginForm = ({
	form,
	history,
	...rest
}: FormComponentProps & RouteComponentProps) => {
	const { getFieldValue } = form;
	const [login] = useLogin({
		email: getFieldValue("email"),
		password: getFieldValue("password")
	});
	const handleSubmit = (e: React.FormEvent<any>) => {
		e.preventDefault();
		form.validateFields(async (err, values) => {
			if (!err) {
				await login();
				history.push("/");
			} else {
				console.log(err);
			}
		});
	};
	const { getFieldDecorator } = form;

	return (
		<Form onSubmit={handleSubmit} id="login-form">
			<Form.Item>
				{getFieldDecorator("email", {
					rules: [{ required: true, message: "Please input your email!" }]
				})(
					<Input
						prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
						placeholder="Email"
					/>
				)}
			</Form.Item>
			<Form.Item>
				{getFieldDecorator("password", {
					rules: [{ required: true, message: "Please input your Password!" }]
				})(
					<Input
						prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
						type="password"
						placeholder="Password"
					/>
				)}
			</Form.Item>
			<Form.Item>
				{getFieldDecorator("remember", {
					valuePropName: "checked",
					initialValue: true
				})(<Checkbox>Remember me</Checkbox>)}
				<a className="login-form-forgot" href="">
					Forgot password
        </a>
			</Form.Item>
			<Form.Item>
				<Button
					form="login-form"
					style={{ width: "100%" }}
					type="primary"
					key="submit"
					htmlType="submit"
				>
					Log in
        </Button>
			</Form.Item>
		</Form>
	);
};

const MyLoginForm = Form.create({ name: "login-form" })(withRouter(LoginForm));

export { MyLoginForm as LoginForm };
