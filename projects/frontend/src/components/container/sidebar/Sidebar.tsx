import * as React from 'react';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { IChildableProps } from '../../../types/props/Childable.props';
import styled from 'styled-components';

interface ISidebarProps extends IStyledComponentProps, IChildableProps {
	orientation?: 'left' | 'right';
	width?: number | string;
	height?: number | string;
}

class SidebarComponent extends React.Component<ISidebarProps>{
	constructor(props: ISidebarProps) {
		super({
			orientation: props.orientation ? props.orientation : 'left',
			width: props.width !== undefined ? props.width : 200,
			height: props.height !== undefined ? props.height : '100%'
		});
	}
	public render() {
		const { children, className } = this.props;

		return (
			<div className={className}>
				{children}
			</div>
		);
	}
}

const SidebarStyled = styled(SidebarComponent)`
	width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width};
	height: ${props => typeof props.height === 'number' ? `${props.height}px` : props.height};
	self-align: ${props => props.orientation === 'left' ? 'flex-start' : 'flex-end'};
`;

export const Sidebar = SidebarStyled;