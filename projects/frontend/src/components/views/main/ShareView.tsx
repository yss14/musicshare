import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router';
import { useDispatch } from '../../../redux/custom-store-hooks';
import { fetchShares } from '../../../redux/shares/shares.actions';
import { useUser } from '../../../hooks/use-user';
import { useAPIs } from '../../../hooks/use-apis';
import { MainView } from './MainView';
import useRouter from 'use-react-router';

export const ShareView = () => (
	<Switch>
		<Route path="/shares/:shareID" component={WrappedMainView} />
	</Switch>
);

export const ShareProvider: React.FunctionComponent<{}> = ({ children }) => {
	const [sharesFetched, setSharesFetched] = useState<boolean>(false);
	const dispatch = useDispatch();

	const { id: userID } = useUser();
	const { musicshareAPI } = useAPIs();
	const { history } = useRouter();

	useEffect(() => {
		if (userID) {
			dispatch(fetchShares(musicshareAPI, userID)).then(() => {
				setSharesFetched(true);
			});
		}
	}, [musicshareAPI, userID, dispatch]);

	if (!userID) {
		history.push('/');

		return null;
	}

	return sharesFetched && children ? (<React.Fragment>{children}</React.Fragment>) : null;
}

const WrappedMainView = () => (
	<ShareProvider>
		<MainView />
	</ShareProvider>
)