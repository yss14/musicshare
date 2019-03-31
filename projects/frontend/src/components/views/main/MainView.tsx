import * as React from 'react';
import { Player } from '../../player/Player';
import styled from 'styled-components'
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { MainViewSidebarLeft } from './MainViewSidebarLeft';
import { IStoreSchema } from '../../../redux/store.schema';
import { connect } from 'react-redux';
import { fetchShares, ISharesFetched, IShareSongsFetched, fetchSongs } from '../../../redux/shares/shares.actions';
import { DispatchPropThunk } from '../../../types/props/DispatchPropThunk';
import { withRouter, RouteComponentProps } from 'react-router';
import { IRouteShare } from '../../../types/props/RouterProps';
import { ISharesSchema } from '../../../redux/shares/shares.schema';
import { SongList } from '../../container/song-list/SongList';
import { MainViewSidebarRight } from './MainViewSidebarRight';
import { useContext } from 'react';
import { APIContext } from '../../../context/APIContext';

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

interface IMainViewProps extends RouteComponentProps<IRouteShare>, IStyledComponentProps,
	DispatchPropThunk<IStoreSchema, ISharesFetched & IShareSongsFetched> {
	userID: string | null;
	shares: ISharesSchema;
}

class MainViewComponent extends React.Component<IMainViewProps> {

	public componentDidUpdate(prevProps: IMainViewProps) {
		const { dispatch, userID, match, history, shares } = this.props;

		const { musicshareAPI } = useContext(APIContext);

		if (prevProps.userID === null && this.props.userID !== null) {
			dispatch(fetchShares(musicshareAPI, userID!));
		}

		if (shares.length > 0) {
			const selectedShare = shares.find(share => share.idHash === match.params.shareID);

			if (!selectedShare) {
				history.push('/404');
			} else {
				if (prevProps.shares.length === 0) {
					// get songs for current selected share
					dispatch(fetchSongs(musicshareAPI, selectedShare.id));
				}
			}
		}
	}

	public render() {
		const { className, shares, match } = this.props;
		const selectedShare = shares.find(share => share.idHash === match.params.shareID);

		return (
			<div className={className}>
				<MainViewWrapper>
					<MainViewSidebarLeft />
					<MainViewMainView>
						{
							selectedShare ? <SongList songs={selectedShare.songs} /> : null
						}
					</MainViewMainView>
					<MainViewSidebarRight />
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