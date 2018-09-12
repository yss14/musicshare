import * as React from 'react';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { IChildableProps } from '../../../types/props/Childable.props';
import styled from 'styled-components';
import { IInlineStyleableProps } from '../../../types/props/InlineStyleable.props';

interface ISidebarProps extends IStyledComponentProps, IChildableProps, IInlineStyleableProps {
	orientation?: 'left' | 'right';
	width?: number | string;
	height?: number | string;
}

class SidebarComponent extends React.Component<ISidebarProps>{
	constructor(props: ISidebarProps) {
		super(props);
	}

	public render() {
		const { children, className, css } = this.props;

		return (
			<div className={className} style={css}>
				{children}
			</div>
		);
	}
}

const SidebarStyled = styled(SidebarComponent)`
	width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width};
	height: 100%;
	height: ${props => typeof props.height === 'number' ? `${props.height}px` : props.height};
	align-self: ${props => props.orientation === 'left' ? 'flex-start' : 'flex-end'};
	display: flex;
	flex-flow: column nowrap;
`;

export const Sidebar = SidebarStyled;