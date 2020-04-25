import React from "react"
import { Modal, Input, Form } from "antd"

interface IPromptProps {
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	onSubmit: () => any
	onCancel: () => any
	okText?: string
	cancelText?: string
	title: string
	label?: string
	placeholder?: string
	value: string
	validationError?: string
}

export const Prompt = ({
	onSubmit,
	onCancel,
	okText,
	cancelText,
	title,
	placeholder,
	onChange,
	value,
	label,
	validationError,
}: IPromptProps) => (
	<Modal title={title} visible={true} onOk={onSubmit} onCancel={onCancel} okText={okText} cancelText={cancelText}>
		<Form>
			<Form.Item label={label} validateStatus={validationError ? "error" : "success"}>
				<Input value={value} type="text" onChange={onChange} placeholder={placeholder} />
			</Form.Item>
		</Form>
	</Modal>
)
