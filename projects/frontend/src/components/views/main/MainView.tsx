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
import { withRouter, RouteComponentProps } from 'react-router';
import { IRouteShare } from '../../../types/props/RouterProps';
import { ISharesSchema } from '../../../redux/shares/shares.schema';

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

interface IMainViewProps extends RouteComponentProps<IRouteShare>, IStyledComponentProps, DispatchPropThunk<IStoreSchema, ISharesFetched> {
	userID: string;
	shares: ISharesSchema;
}

class MainViewComponent extends React.Component<IMainViewProps> {

	public componentDidUpdate(prevProps: IMainViewProps) {
		const { dispatch, userID, match, history, shares } = this.props;

		if (prevProps.userID === null && this.props.userID !== null) {
			dispatch(fetchShares(
				new MusicShareApi(process.env.REACT_APP_MUSICSHARE_BACKEND_URL),
				userID
			));
		}

		if (shares.length > 0 && !shares.some(share => share.idHash === match.params.shareID)) {
			// shareID from url is not found
			history.push('/404');
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
	userID: store.user.id,
	shares: store.shares
})

export const MainView = withRouter(connect(mapStateToProps)(MainViewStyled));