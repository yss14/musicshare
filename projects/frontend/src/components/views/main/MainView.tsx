import * as React from 'react';
import { Player } from '../../player/Player';
import styled from 'styled-components'
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { MainViewSidebarLeft } from './MainViewSidebarLeft';
import { IStoreSchema } from '../../../redux/store.schema';
import { connect } from 'react-redux';
import { fetchShares, ISharesFetched } from '../../../redux/shares/shares.actions';
import { DispatchPropThunk } from '../../../types/props/DispatchPropThunk';
import { MusicShareApi } from '../../../apis/musicshare-api';

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

interface IMainViewProps extends IStyledComponentProps, DispatchPropThunk<IStoreSchema, ISharesFetched> {
	userID: string;
}

class MainViewComponent extends React.Component<IMainViewProps> {

	public componentDidUpdate(prevProps: IMainViewProps) {
		// TODO fetch library data
		const { dispatch, userID } = this.props;

		if (prevProps.userID === null && this.props.userID !== null) {
			dispatch(fetchShares(
				new MusicShareApi(process.env.REACT_APP_MUSICSHARE_BACKEND_URL),
				userID
			));
		}
	}

	public render() {
		const { className } = this.props;

		return (
			<div className={className}>
				<MainViewWrapper>
					<MainViewSidebarLeft />
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

const mapStateToProps = (store: IStoreSchema) => ({
	userID: store.user.id
})

export const MainView = connect(mapStateToProps)(MainViewStyled);