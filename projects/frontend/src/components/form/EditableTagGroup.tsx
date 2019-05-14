import React from 'react';
import { Tag, Input, Tooltip, Icon } from 'antd';
import { useState, useRef } from 'react';

interface IEditableTagGroupProps {
	values: string[];
	onValuesChange: (newValues: string[]) => void;
	placeholder?: string;
}

interface IEditableTagGroupState {
	inputVisible: boolean;
	inputValue: string;
}

export const EditableTagGroup = ({ values, onValuesChange: onValueChange, placeholder }: IEditableTagGroupProps) => {
	const [state, setState] = useState<IEditableTagGroupState>({
		inputVisible: false,
		inputValue: '',
	});
	const inputRef = useRef<Input>(null)

	const handleClose = (removedValue: string) => {
		const newValues = values.filter(value => value !== removedValue);

		onValueChange(newValues);
	};

	const showInput = () => {
		setState({ ...state, inputVisible: true });

		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleInputChange = (e: any) => {
		setState({ ...state, inputValue: e.target.value });
	};

	const handleInputConfirm = () => {
		const { inputValue } = state;
		let newValues = [...values];

		if (inputValue && values.indexOf(inputValue) === -1) {
			newValues.push(inputValue);
		}

		setState({
			...state,
			inputVisible: false,
			inputValue: '',
		});

		onValueChange(newValues);
	};

	const { inputVisible, inputValue } = state;

	return (
		<div>
			{values.map((value, index) => {
				const isLongValue = value.length > 30;
				const valueElement = (
					<Tag key={value} closable={index !== 0} onClose={() => handleClose(value)}>
						{isLongValue ? `${value.slice(0, 20)}...` : value}
					</Tag>
				);
				return isLongValue ? (
					<Tooltip title={value} key={value}>
						{valueElement}
					</Tooltip>
				) : (
						valueElement
					);
			})}
			{inputVisible && (
				<Input
					ref={inputRef}
					type="text"
					size="small"
					style={{ width: 100 }}
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputConfirm}
					onPressEnter={handleInputConfirm}
				/>
			)}
			{!inputVisible && (
				<Tag onClick={showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
					<Icon type="plus" />
					{placeholder || 'New Tag'}
				</Tag>
			)}
		</div>
	);
}