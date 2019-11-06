import React from 'react';
import { Dropdown as DropdownAntd, Menu, Icon, Button } from 'antd';
import { ClickParam } from 'antd/lib/menu';

interface IDropdownOption {
	value: string;
	label: string;
}

interface IDropdownProps {
	value: string | null | undefined;
	options: IDropdownOption[];
	onChange: (newValue: string) => void;
	name?: string;
	readOnly?: boolean;
}

export const Dropdown = ({ onChange, options, value, name, readOnly }: IDropdownProps) => {
	const onItemClick = (e: ClickParam) => {
		onChange(e.key);
	}

	const dropdownItems = (
		<Menu onClick={onItemClick}>
			{
				options.map(option => (
					<Menu.Item key={option.value}>{option.label}</Menu.Item>
				))
			}
		</Menu>
	)

	const selectedOption = options.find(option => option.value === value);

	return (
		<DropdownAntd overlay={dropdownItems} disabled={readOnly}>
			<Button name={name}>
				{selectedOption ? selectedOption.label : 'No selection'} <Icon type="down" />
			</Button>
		</DropdownAntd>
	)
}