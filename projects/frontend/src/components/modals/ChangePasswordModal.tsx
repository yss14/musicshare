import React, { useCallback } from "react"
import { LockOutlined } from "@ant-design/icons"
import { Modal, Input, Alert, message, Form } from "antd"
import { useFormik } from "formik"
import { useChangePassword } from "@musicshare/react-graphql-client"

interface IFormValues {
	oldPassword: string
	newPassword: string
	newPasswordRepitition: string
}

const initialFormValues: IFormValues = {
	oldPassword: "",
	newPassword: "",
	newPasswordRepitition: "",
}

const validateForm = ({ oldPassword, newPassword, newPasswordRepitition }: IFormValues) => {
	const errors: Partial<IFormValues> = {}

	if (oldPassword.trim().length < 8) {
		errors.oldPassword = "Password must be at least 8 characters long"
	}

	if (newPassword.trim().length < 8) {
		errors.newPassword = "Password must be at least 8 characters long"
	}

	if (newPassword !== newPasswordRepitition) {
		errors.newPasswordRepitition = "Passwords must match"
	}

	return errors
}

interface IChangePasswordModalProps {
	onClose: () => any
}

export const ChangePasswordModal: React.FC<IChangePasswordModalProps> = ({ onClose }) => {
	const [changePassword, { error }] = useChangePassword({
		onError: console.error,
		onSuccess: () => {
			message.success("Password has been changed")
			onClose()
		},
	})
	const onSubmit = useCallback(
		(input: IFormValues) => {
			const {newPasswordRepitition, ...payload} = input

			changePassword({ input: payload })
		},
		[changePassword],
	)
	const { handleSubmit, errors, values, handleChange, isValid, handleBlur, touched, dirty } = useFormik({
		initialValues: initialFormValues,
		onSubmit,
		validate: validateForm,
	})

	const errorAlert = error && <Alert message={error.message.replace("GraphQL error: ", "")} type="error" />

	return (
		<Form>
			<Modal
				title="Change Password"
				visible={true}
				onCancel={onClose}
				okText="Change Password"
				onOk={() => handleSubmit()}
				okButtonProps={{
					htmlType: "submit",
					disabled: !(isValid && dirty),
				}}
			>
				{errorAlert}
				<Form.Item
					validateStatus={touched.oldPassword && errors.oldPassword ? "error" : "success"}
					help={errors.oldPassword}
				>
					<Input
						prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
						placeholder="Current Password"
						type="password"
						name="oldPassword"
						value={values.oldPassword}
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
						placeholder="New Password"
						type="password"
						name="newPassword"
						value={values.newPassword}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
				</Form.Item>
				<Form.Item
					validateStatus={touched.newPasswordRepitition && errors.newPasswordRepitition ? "error" : "success"}
					help={errors.newPasswordRepitition}
				>
					<Input
						prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
						placeholder="New Password Repitition"
						type="password"
						name="newPasswordRepitition"
						value={values.newPasswordRepitition}
						onChange={handleChange}
						onBlur={handleBlur}
					/>
				</Form.Item>
			</Modal>
		</Form>
	)
}
