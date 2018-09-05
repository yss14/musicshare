import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';

export interface IDropdownItemProps extends IStyledComponentProps {
	value: any;
	selected: boolean;
	onClick?: () => void;
}

export const DropdownItem = styledTS<IDropdownItemProps>(styled.div)`
	& {
		width: 200px;
		padding: 5px;
		border: 1px solid #4f504b;
		border-top: none;
		cursor: pointer;
		font-size: 12px;
	}


`;

