import React, { useState, useEffect } from 'react';
import { Player } from '../../player/Player';
import styled from 'styled-components'
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import { MainViewSidebarLeft } from './MainViewSidebarLeft';
import { fetchSongs } from '../../../redux/shares/shares.actions';
import { IRouteShare } from '../../../types/props/RouterProps';
import { ISharesSchema, IShareSchema } from '../../../redux/shares/shares.schema';
import { SongList } from '../../container/song-list/SongList';
import { MainViewSidebarRight } from './MainViewSidebarRight';
import { useContext } from 'react';
import { APIContext } from '../../../context/APIContext';
import { useMappedState, useDispatch } from '../../../redux/custom-store-hooks';
import useReactRouter from 'use-react-router';

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

interface IMainViewProps extends IStyledComponentProps {
	userID: string;
	shares: ISharesSchema;
	share: IShareSchema;
}

const MainViewComponent: React.FunctionComponent<IMainViewProps> = ({ className, share }) => (
	<div className={className}>
		<MainViewWrapper>
			<MainViewSidebarLeft />
			<MainViewMainView>
				<SongList songs={share.songs} />
			</MainViewMainView>
			<MainViewSidebarRight />
		</MainViewWrapper>
		<Player />
	</div>
)

const MainViewStyled = styled(MainViewComponent)`
	display: flex;
	flex-direction: column;
	height: 100%;
`;

const MainViewHOC = () => {
	const { shares, userID } = useMappedState(state => ({
		userID: state.user.id,
		shares: state.shares
	}));

	const { history, match } = useReactRouter<IRouteShare>();
	const [songFetched, setSongsFetched] = useState<boolean>(false);
	const dispatch = useDispatch();
	const { musicshareAPI } = useContext(APIContext);

	const share = shares.find(share => share.id === match.params.shareID);

	useEffect(() => {
		if (userID && share) {
			dispatch(fetchSongs(musicshareAPI, share.id)).then(() => {
				setSongsFetched(true);
			});
		}
	}, [musicshareAPI, share, dispatch, userID]);

	if (userID === null || !share) {
		history.push('/404');

		return null;
	}

	return songFetched ? <MainViewStyled shares={shares} userID={userID} share={share} /> : null;
}

export const MainView = MainViewHOC;