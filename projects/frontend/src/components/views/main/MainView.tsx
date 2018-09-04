import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Player } from '../../player/Player';
import styled from 'styled-components'
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { Sidebar } from '../../container/sidebar/Sidebar';

const MainViewWrapper = styled.div`
	flex: 1;
	width: 100%;
	background-color: red;
	display: flex;
	flex-direction: row;
`;

const MainViewMainView = styled.div`
	flex: 1;
`;

interface IMainViewProps extends RouteComponentProps<MainViewComponent>, IStyledComponentProps {

}

class MainViewComponent extends React.Component<IMainViewProps> {
	public render() {
		const { match, className } = this.props;
		console.log(match);
		return (
			<div className={className}>
				<MainViewWrapper>
					<Sidebar orientation="left" width={200}>
						Sidebar
					</Sidebar>
					<MainViewMainView>Main</MainViewMainView>
				</MainViewWrapper>
				<Player />
			</div>
		)
	}
}

const MainViewStyled = styled(MainViewComponent)`
	display: flex;
	flex-direction: column;
	height: 100%;
`;

export const MainView = withRouter(MainViewStyled);