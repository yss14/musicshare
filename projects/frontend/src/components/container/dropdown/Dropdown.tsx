import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { IDropdownItemProps, DropdownItem } from './DropdownItem';
import { IInlineStyleableProps } from '../../../types/props/InlineStyleable.props';

interface IDropdownListProps {
	visible: boolean;
}

const DropdownList = styledTS<IDropdownListProps>(styled.div)`
	display: ${props => props.visible ? 'block' : 'none'};
`;

const DropdownButton = styled.button`
	width: 200px;
	color: #565656;
	background-color: white;
	padding: 5px;
	border: 1px solid #565656;
	outline: none;
	cursor: pointer;
	font-size: 14px;
`;

interface IDropdownProps extends IStyledComponentProps, IInlineStyleableProps {
	title: string;
	children: React.ReactElement<IDropdownItemProps & { children: string }>[];
	onChange: (newVal: string) => void;
	width?: number | string;
}

interface IDropdownState {
	open: boolean;
}

class DropdownComponent extends React.Component<IDropdownProps, IDropdownState>{
	constructor(props: IDropdownProps) {
		super(props);

		this.state = {
			open: false,
		}

		this.onClickDropdown = this.onClickDropdown.bind(this);
		this.onClickItem = this.onClickItem.bind(this);
	}

	private onClickDropdown() {
		this.setState({
			...this.state,
			open: !this.state.open
		})
	}

	private onClickItem(val: string) {
		this.props.onChange(val);

		this.onClickDropdown();
	}

	public render() {
		const { className, children, css, title } = this.props;

		const renderedTitle = children.some(child => child.props.selected)
			? children.find(child => child.props.selected).props.children
			: title

		return (
			<div className={className} style={css}>
				<DropdownButton onClick={this.onClickDropdown}>{renderedTitle}</DropdownButton>
				<DropdownList visible={this.state.open}>
					{
						children.map((child, idx) => (
							<DropdownItem
								{...child.props}
								onClick={this.onClickItem.bind(this, child.props.value)}
								key={idx}
							>
								{child.props.children}
							</DropdownItem>
						))
					}
				</DropdownList>
			</div>
		)
	}
}

const DropdownStyled = styled(DropdownComponent)`

`;

export const Dropdown = DropdownStyled;