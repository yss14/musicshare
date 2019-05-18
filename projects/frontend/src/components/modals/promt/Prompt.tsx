import React, { useState } from 'react';
import { Modal, Input } from 'antd';

interface IPromptProps {
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: () => any;
	onCancel: () => any;
	okText?: string;
	cancelText?: string;
	title: string;
	placeholder?: string;
	value: string;
}

export const Prompt = ({ onSubmit, onCancel, okText, cancelText, title, placeholder, onChange, value }: IPromptProps) => (
	<Modal
		title={title}
		visible={true}
		onOk={onSubmit}
		onCancel={onCancel}
		okText={okText}
		cancelText={cancelText}
	>
		<Input
			value={value}
			type="text"
			onChange={onChange}
			placeholder={placeholder}
		/>
	</Modal>
);