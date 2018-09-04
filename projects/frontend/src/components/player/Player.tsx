import * as React from 'react';
import styled from 'styled-components';
import { IStyledComponentProps } from '../../types/props/StyledComponent.props';

interface IPlayerProps extends IStyledComponentProps {
	dummy?: any; // TODO remove
}

class PlayerComponent extends React.Component<IPlayerProps>{
	public render() {
		const { className } = this.props;

		return (
			<div className={className}>
				Player
			</div>
		);
	}
}

const PlayerStyled = styled(PlayerComponent)`
	width: 100%;
	height: 60px;
	background-color: blue;
`;

export const Player = PlayerStyled;